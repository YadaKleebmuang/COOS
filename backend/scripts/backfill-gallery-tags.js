require('dotenv').config({ path: __dirname + '/../.env' });
const { pool } = require('../src/config/db.js');

const isDryRun = process.argv.includes('--dry-run');

async function backfill() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log(`Starting backfill for legacy gallery images... ${isDryRun ? '[DRY-RUN MODE]' : '[LIVE MODE]'}`);

    // Track queries to prove ZERO DML in dry-run
    let dmlQueries = 0;
    const originalQuery = connection.query.bind(connection);
    connection.query = async function (sql, values) {
      const isDML = /^\s*(INSERT|UPDATE|DELETE)/i.test(sql);
      if (isDML) {
        if (isDryRun) {
          throw new Error(`[FATAL] DRY-RUN ATTEMPTED TO EXECUTE DML: ${sql}`);
        }
        dmlQueries++;
      }
      return originalQuery(sql, values);
    };

    // 1. Fetch all selected_final orderImages for completed orders
    const [orderImages] = await connection.query(`
      SELECT oi.orderImageId, oi.imageUrl, oi.orderId, o.orderStatus, o.orderIsGalleryAllowed
      FROM orderImages oi
      JOIN orders o ON oi.orderId = o.orderId
      WHERE oi.imageType = 'selected_final' AND o.orderStatus = 'completed'
    `);

    console.log(`Found ${orderImages.length} selected_final images in completed orders.`);

    let tagSyncCount = 0;
    let visibilityRepairCount = 0;
    let approvalRepairCount = 0;
    const tagReports = [];
    const visibilityReports = [];
    const unmatchedReports = [];

    for (const oi of orderImages) {
      // Find matching galleryImage
      const [galleryImages] = await connection.query(
        `SELECT imageId, imageTitle, imageIsActive, imageApprovalStatus FROM galleryImages WHERE imageUrl = ?`,
        [oi.imageUrl]
      );

      if (galleryImages.length > 0) {
        const gi = galleryImages[0];

        // Find tags for the order image
        const [orderTags] = await connection.query(
          `SELECT t.tagName, t.tagId
           FROM orderImageTags oit
           JOIN tags t ON oit.tagId = t.tagId
           WHERE oit.orderImageId = ?`,
          [oi.orderImageId]
        );

        // Find existing tags for the gallery image
        const [galleryTags] = await connection.query(
          `SELECT t.tagName, t.tagId
           FROM galleryImageTags git
           JOIN tags t ON git.tagId = t.tagId
           WHERE git.imageId = ?`,
          [gi.imageId]
        );

        const currentOrderTags = orderTags.map(t => t.tagName);
        const currentGalleryTags = galleryTags.map(t => t.tagName);

        const tagsToInsert = orderTags.filter(ot => !currentGalleryTags.includes(ot.tagName));

        tagReports.push({
          orderId: oi.orderId,
          orderImageId: oi.orderImageId,
          galleryImageId: gi.imageId,
          imageUrl: oi.imageUrl,
          currentOrderImageTags: currentOrderTags,
          currentGalleryImageTags: currentGalleryTags,
          tagsToBeInserted: tagsToInsert.map(t => t.tagName)
        });

        if (!isDryRun && tagsToInsert.length > 0) {
          for (const tag of tagsToInsert) {
            await connection.query(
              `INSERT IGNORE INTO galleryImageTags (imageId, tagId) VALUES (?, ?)`,
              [gi.imageId, tag.tagId]
            );
            tagSyncCount++;
          }
        } else if (isDryRun) {
          tagSyncCount += tagsToInsert.length;
        }

        // Visibility & Approval repair: strict correlation
        const needsApprovalRepair = gi.imageApprovalStatus !== 'pending';
        const needsVisibilityRepair = gi.imageIsActive !== 0;

        const isAutoCreatedTitle = gi.imageTitle && (
          gi.imageTitle.includes('(รออนุมัติ)') ||
          gi.imageTitle.trim() === `Order #${oi.orderId}`
        );

        if (isAutoCreatedTitle && (needsApprovalRepair || needsVisibilityRepair)) {
          const reportItem = {
            orderId: oi.orderId,
            orderImageId: oi.orderImageId,
            galleryImageId: gi.imageId,
            imageTitle: gi.imageTitle,
            imageUrl: oi.imageUrl,
            currentImageIsActive: gi.imageIsActive,
            currentImageApprovalStatus: gi.imageApprovalStatus,
            proposedImageIsActive: 0,
            proposedImageApprovalStatus: 'pending',
            repairTypes: []
          };

          if (needsApprovalRepair) {
            approvalRepairCount++;
            reportItem.repairTypes.push('approval');
          }
          if (needsVisibilityRepair) {
            visibilityRepairCount++;
            reportItem.repairTypes.push('visibility');
          }

          visibilityReports.push(reportItem);

          if (!isDryRun) {
            await connection.query(`
              UPDATE galleryImages
              SET imageIsActive = 0, imageApprovalStatus = 'pending'
              WHERE imageId = ?
            `, [gi.imageId]);
          }
        }
      } else {
        // UNMATCHED ANALYSIS
        let reason = "UNKNOWN";
        if (oi.orderIsGalleryAllowed === 0) {
          reason = "A. EXPECTED NO GALLERY (orderIsGalleryAllowed = 0)";
        } else {
          // Check if any galleryImages exist for this order by orderId indirectly (e.g. title)
          const [orderGalleryImages] = await connection.query(
            `SELECT imageId FROM galleryImages WHERE imageTitle LIKE ?`,
            [`%Order #${oi.orderId}%`]
          );
          if (orderGalleryImages.length > 0) {
            reason = "C. URL / MAPPING MISMATCH (Gallery images exist for this order but URLs do not match)";
          } else {
            reason = "B. LEGACY ORDER WITHOUT GALLERY CREATION (No autoPublish triggered)";
          }
        }

        unmatchedReports.push({
          orderId: oi.orderId,
          orderImageId: oi.orderImageId,
          imageUrl: oi.imageUrl,
          orderStatus: oi.orderStatus,
          orderIsGalleryAllowed: oi.orderIsGalleryAllowed,
          reason
        });
      }
    }

    console.log("\n--- UNMATCHED SELECTED_FINAL REPORT ---");
    if (unmatchedReports.length > 0) {
      console.table(unmatchedReports.slice(0, 10)); // Show up to 10
      if (unmatchedReports.length > 10) console.log(`... and ${unmatchedReports.length - 10} more.`);
    } else {
      console.log("No unmatched selected_final images.");
    }

    console.log("\n--- TAG MIGRATION REPORT ---");
    const activeTags = tagReports.filter(r => r.tagsToBeInserted.length > 0);
    console.table(activeTags.slice(0, 5));
    if (activeTags.length > 5) {
      console.log(`... and ${activeTags.length - 5} other images requiring tag insertion.`);
    }

    console.log("\n--- VISIBILITY REPAIR REPORT ---");
    if (visibilityReports.length > 0) {
      console.table(visibilityReports);
    } else {
      console.log("No images require visibility repair.");
    }

    if (isDryRun) {
      console.log(`\n[LIVE SCOPE PREVIEW]`);
      console.log(`TAG BACKFILL:`);
      console.log(`- ${activeTags.length} gallery images require tags`);
      console.log(`- ${tagSyncCount} total associations to insert`);
      console.log(`APPROVAL / VISIBILITY REPAIR:`);
      console.log(`- ${approvalRepairCount} gallery images require approval status repair (approved -> pending)`);
      console.log(`- ${visibilityRepairCount} gallery images require active state reset`);
      console.log(`- IDs: [${visibilityReports.map(r => r.galleryImageId).join(', ')}]`);
      console.log(`SKIPPED UNMATCHED:`);
      console.log(`- ${unmatchedReports.length} records skipped`);
      const reasons = unmatchedReports.reduce((acc, curr) => {
        acc[curr.reason] = (acc[curr.reason] || 0) + 1;
        return acc;
      }, {});
      console.log(`- classified reasons:`, reasons);
      console.log(`\n[DRY-RUN] DML Statements intercepted: ${dmlQueries}`);
      await connection.rollback();
      console.log("[DRY-RUN] Rollback complete. No database mutations occurred.");
    } else {
      await connection.commit();
      console.log(`[LIVE] Executed ${dmlQueries} DML statements.`);
      console.log(`[LIVE] Synchronized ${tagSyncCount} new tag associations to galleryImageTags.`);
      console.log(`[LIVE] Repaired imageApprovalStatus = 'pending' for ${approvalRepairCount} gallery images.`);
      console.log(`[LIVE] Repaired imageIsActive = 0 for ${visibilityRepairCount} gallery images.`);
      console.log("[LIVE] Backfill completed successfully.");
    }

  } catch (err) {
    await connection.rollback();
    console.error("Backfill failed:", err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

backfill();

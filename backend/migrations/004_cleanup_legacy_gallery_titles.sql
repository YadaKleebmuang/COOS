-- Safe one-time cleanup of legacy auto-generated Gallery titles.
-- Removes the legacy approval-status suffix only from titles generated
-- in the exact form: Order #<number> (รออนุมัติ)

UPDATE galleryImages
SET imageTitle = LEFT(
  imageTitle,
  CHAR_LENGTH(imageTitle) - CHAR_LENGTH(' (รออนุมัติ)')
)
WHERE imageTitle REGEXP '^Order #[0-9]+ \\(รออนุมัติ\\)$';

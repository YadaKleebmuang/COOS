const { pool } = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    let dateFilter = "";
    const params = [];

    if (from && to) {
      dateFilter = "AND orderCreatedAt >= ? AND orderCreatedAt <= ?";
      params.push(from, to + " 23:59:59");
    }

    // 1. KPI Stats
    const [[kpi]] = await pool.query(
      `SELECT 
        COUNT(orderId) as totalOrders,
        SUM(CASE WHEN orderStatus = 'completed' THEN 1 ELSE 0 END) as completedOrders,
        SUM(CASE WHEN orderStatus = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders,
        SUM(orderTotalPrice) as totalRevenue
       FROM orders WHERE 1=1 ${dateFilter}`,
      params
    );

    // 2. New Customers
    const [[{ newCustomers }]] = await pool.query(
      `SELECT COUNT(userId) as newCustomers FROM users WHERE userRole = 'customer' 
       ${from && to ? "AND userCreatedAt >= ? AND userCreatedAt <= ?" : ""}`,
      params
    );

    // 3. Orders by Status
    const [ordersByStatus] = await pool.query(
      `SELECT orderStatus as status, COUNT(orderId) as count 
       FROM orders WHERE 1=1 ${dateFilter} GROUP BY orderStatus`,
      params
    );

    // 4. Popular Packages
    const [popularPackages] = await pool.query(
      `SELECT p.packageName as name, COUNT(o.orderId) as count, SUM(o.orderTotalPrice) as revenue
       FROM orders o
       JOIN packages p ON o.packageId = p.packageId
       WHERE 1=1 ${dateFilter}
       GROUP BY p.packageId
       ORDER BY count DESC LIMIT 5`,
      params
    );

    // 5. Editor Workload
    const [editorWorkload] = await pool.query(
      `SELECT u.userFirstName as name, 
              COUNT(o.orderId) as completedJobs, 
              COALESCE(AVG(DATEDIFF(o.orderUpdatedAt, o.orderCreatedAt)), 0) as avgDays
       FROM users u
       LEFT JOIN orders o ON u.userId = o.editorId AND o.orderStatus = 'completed' ${dateFilter.replace(/orderCreatedAt/g, 'o.orderCreatedAt')}
       WHERE u.userRole = 'editor'
       GROUP BY u.userId`,
      params
    );

    // 6. Revenue by Month
    const [revenueByMonth] = await pool.query(
      `SELECT DATE_FORMAT(orderCreatedAt, '%b') as month, SUM(orderTotalPrice) as revenue
       FROM orders
       WHERE orderStatus != 'cancelled'
       GROUP BY DATE_FORMAT(orderCreatedAt, '%Y-%m')
       ORDER BY DATE_FORMAT(orderCreatedAt, '%Y-%m') DESC LIMIT 6`
    );

    res.status(200).json({
      totalOrders: kpi.totalOrders || 0,
      totalRevenue: kpi.totalRevenue || 0,
      completedOrders: kpi.completedOrders || 0,
      cancelledOrders: kpi.cancelledOrders || 0,
      newCustomers: newCustomers || 0,
      ordersByStatus,
      popularPackages,
      editorWorkload,
      revenueByMonth: revenueByMonth.reverse(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

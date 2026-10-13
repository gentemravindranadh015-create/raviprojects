RAVI PRODUCT MANAGEMENT SYSTEM
===============================

FEATURES
- Responsive dashboard with inventory totals, stock value and low-stock count
- Add, view, search, update and delete products (CRUD)
- HTML, CSS, JavaScript frontend
- Node.js + Express backend
- MySQL 8 database connection
- Local SVG illustration included in public/images

REQUIREMENTS
1. Node.js installed
2. MySQL Server 8.0 running
3. MySQL Workbench or MySQL command line

SETUP
1. Extract this ZIP.
2. Open the extracted folder in VS Code.
3. Open productdb.sql in MySQL Workbench and execute the whole script.
   It creates database ravi_product_db, table products, and four sample products.
4. Open server.js and the default password is set to the one in your uploaded server file. If it changed,
   update the password in server.js or set the MYSQL_PASSWORD environment variable.
5. Open Terminal in this project folder and run:
   npm install
   npm start
6. Open this URL in your browser:
   http://localhost:3000

IMPORTANT
- Do not open the HTML files by double-clicking them. Open the site through
  http://localhost:3000 so frontend API requests reach Node.js.
- If MySQL says Access denied, verify the password in server.js and make sure
  the MySQL80 service is running.
- If port 3000 is busy, change PORT in server.js.
- Database name: ravi_product_db
- Table name: products
- Columns: product_id, product_name, category, price, quantity, reorder_level
- This project uses the mysql2 Node.js driver to connect to MySQL Server 8.
  "MySQL 8" is the database server version; mysql2 is the Node.js driver package.

UPDATED UI: Product Category dropdown is available on Add/Update forms. All Products page includes a category filter dropdown. Dashboard includes online product-category photos from Unsplash; internet is required to display these photos.

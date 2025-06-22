const express = require('express');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const brandController = require('../controllers/brandController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes - Products
router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/:id', productController.getProduct);

// Public routes - Categories
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategory);
router.get('/categories/:id/products', categoryController.getCategoryProducts);

// Public routes - Brands
router.get('/brands', brandController.getAllBrands);
router.get('/brands/:id', brandController.getBrand);
router.get('/brands/:id/products', brandController.getBrandProducts);

// Protected routes - Admin only
router.use(protect);

// Product management (Admin/Store Keeper)
router
  .route('/products')
  .post(restrictTo('ROLE_ADMIN', 'ROLE_STORE_KEEPER'), productController.createProduct);

router
  .route('/products/:id')
  .put(restrictTo('ROLE_ADMIN', 'ROLE_STORE_KEEPER'), productController.updateProduct)
  .delete(restrictTo('ROLE_ADMIN'), productController.deleteProduct);

// Alert threshold update (Admin/Store Keeper)
router.put('/products/:id/alert-threshold', restrictTo('ROLE_ADMIN', 'ROLE_STORE_KEEPER'), productController.updateAlertThreshold);

// Category management (Admin only)
router
  .route('/categories')
  .post(restrictTo('ROLE_ADMIN'), categoryController.createCategory);

router
  .route('/categories/:id')
  .put(restrictTo('ROLE_ADMIN'), categoryController.updateCategory)
  .delete(restrictTo('ROLE_ADMIN'), categoryController.deleteCategory);

// Brand management (Admin only)
router
  .route('/brands')
  .post(restrictTo('ROLE_ADMIN'), brandController.createBrand);

router
  .route('/brands/:id')
  .put(restrictTo('ROLE_ADMIN'), brandController.updateBrand)
  .delete(restrictTo('ROLE_ADMIN'), brandController.deleteBrand);

module.exports = router;
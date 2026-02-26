import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../core/common/guards/auth/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/stats
   * Platform-wide statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics (Admin only)' })
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  /**
   * GET /admin/recent-activity
   * Recent platform activity feed
   */
  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent platform activity (Admin only)' })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(limit ? parseInt(limit, 10) : 15);
  }

  /**
   * GET /admin/health
   * System health overview
   */
  @Get('health')
  @ApiOperation({ summary: 'Get system health status (Admin only)' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // ─── Users Management ──────────────────────────────

  /**
   * GET /admin/users/stats
   * Platform-wide user statistics
   */
  @Get('users/stats')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  /**
   * GET /admin/users/export
   * Export users as JSON (no pagination) for CSV generation
   */
  @Get('users/export')
  @ApiOperation({ summary: 'Export users (Admin only)' })
  async exportUsers(
    @Query('role') role?: string,
    @Query('emailVerified') emailVerified?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.exportUsers({
      role,
      emailVerified: emailVerified === 'true' ? true : emailVerified === 'false' ? false : undefined,
      startDate,
      endDate,
    });
  }

  /**
   * GET /admin/users
   * Paginated user list with filters
   */
  @Get('users')
  @ApiOperation({ summary: 'Get paginated user list (Admin only)' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('emailVerified') emailVerified?: string,
    @Query('profileCompleted') profileCompleted?: string,
    @Query('has2FA') has2FA?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.adminService.getUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      role,
      emailVerified: emailVerified === 'true' ? true : emailVerified === 'false' ? false : undefined,
      profileCompleted: profileCompleted === 'true' ? true : profileCompleted === 'false' ? false : undefined,
      has2FA: has2FA === 'true' ? true : has2FA === 'false' ? false : undefined,
      startDate,
      endDate,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    });
  }

  /**
   * GET /admin/users/:id
   * Single user details
   */
  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (Admin only)' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  /**
   * PATCH /admin/users/:id/role
   * Update user role
   */
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    return this.adminService.adminUpdateUserRole(id, body.role);
  }

  /**
   * DELETE /admin/users/:id
   * Delete a user
   */
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.adminDeleteUser(id);
  }

  /**
   * DELETE /admin/users/:id/sessions
   * Revoke all sessions for a user
   */
  @Delete('users/:id/sessions')
  @ApiOperation({ summary: 'Revoke all user sessions (Admin only)' })
  async revokeUserSessions(@Param('id') id: string) {
    return this.adminService.adminRevokeUserSessions(id);
  }

  // ─── Stores Management ─────────────────────────────

  /**
   * GET /admin/stores
   * Paginated stores list with filters
   */
  @Get('stores')
  @ApiOperation({ summary: 'Get paginated stores list (Admin only)' })
  async getStores(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('city') city?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.adminService.getStores({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status: status as any,
      categoryId,
      city,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    });
  }

  /**
   * GET /admin/stores/stats
   * Store-specific statistics
   */
  @Get('stores/stats')
  @ApiOperation({ summary: 'Get store statistics (Admin only)' })
  async getStoreStats() {
    return this.adminService.getStoreStats();
  }

  /**
   * GET /admin/stores/:id
   * Single store details
   */
  @Get('stores/:id')
  @ApiOperation({ summary: 'Get store details (Admin only)' })
  async getStoreById(@Param('id') id: string) {
    return this.adminService.getStoreById(id);
  }

  /**
   * PATCH /admin/stores/:id/status
   * Toggle store status
   */
  @Patch('stores/:id/status')
  @ApiOperation({ summary: 'Update store status (Admin only)' })
  async updateStoreStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'INACTIVE' },
  ) {
    return this.adminService.updateStoreStatus(id, body.status);
  }

  /**
   * DELETE /admin/stores/:id
   * Delete a store
   */
  @Delete('stores/:id')
  @ApiOperation({ summary: 'Delete a store (Admin only)' })
  async deleteStore(@Param('id') id: string) {
    return this.adminService.deleteStore(id);
  }

  // ─── Store Categories Management ───────────────────

  /**
   * GET /admin/store-categories
   * All store categories
   */
  @Get('store-categories')
  @ApiOperation({ summary: 'Get all store categories (Admin only)' })
  async getStoreCategories() {
    return this.adminService.getStoreCategories();
  }

  /**
   * POST /admin/store-categories
   * Create a store category
   */
  @Post('store-categories')
  @ApiOperation({ summary: 'Create store category (Admin only)' })
  async createStoreCategory(
    @Body() body: {
      name: string;
      nameAr: string;
      slug: string;
      description?: string;
      descriptionAr?: string;
      icon?: string;
      color?: string;
      order?: number;
      templateFields?: Record<string, any>;
    },
  ) {
    return this.adminService.createStoreCategory(body);
  }

  /**
   * PUT /admin/store-categories/:id
   * Update a store category
   */
  @Put('store-categories/:id')
  @ApiOperation({ summary: 'Update store category (Admin only)' })
  async updateStoreCategory(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      nameAr?: string;
      slug?: string;
      description?: string;
      descriptionAr?: string;
      icon?: string;
      color?: string;
      order?: number;
      isActive?: boolean;
      templateFields?: Record<string, any>;
    },
  ) {
    return this.adminService.updateStoreCategory(id, body);
  }

  /**
   * DELETE /admin/store-categories/:id
   * Delete a store category
   */
  @Delete('store-categories/:id')
  @ApiOperation({ summary: 'Delete store category (Admin only)' })
  async deleteStoreCategory(@Param('id') id: string) {
    return this.adminService.deleteStoreCategory(id);
  }

  // ─── Orders Management ─────────────────────────────

  /**
   * GET /admin/orders/stats
   * Platform-wide order statistics
   */
  @Get('orders/stats')
  @ApiOperation({ summary: 'Get order statistics (Admin only)' })
  async getOrderStats() {
    return this.adminService.getOrderStats();
  }

  /**
   * GET /admin/orders/export
   * Export orders as JSON (no pagination) for CSV generation
   */
  @Get('orders/export')
  @ApiOperation({ summary: 'Export orders (Admin only)' })
  async exportOrders(
    @Query('status') status?: string,
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.exportOrders({ status, storeId, startDate, endDate });
  }

  /**
   * GET /admin/orders
   * Paginated orders list with filters
   */
  @Get('orders')
  @ApiOperation({ summary: 'Get paginated orders list (Admin only)' })
  async getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
  ) {
    return this.adminService.getOrders({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status,
      storeId,
      startDate,
      endDate,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    });
  }

  /**
   * GET /admin/orders/:id
   * Single order details
   */
  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details (Admin only)' })
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  /**
   * PUT /admin/orders/:id/status
   * Update order status
   */
  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
      storeNote?: string;
      estimatedDelivery?: string;
    },
  ) {
    return this.adminService.adminUpdateOrderStatus(
      id,
      body.status,
      body.storeNote,
      body.estimatedDelivery,
    );
  }

  /**
   * DELETE /admin/orders/:id
   * Delete an order
   */
  @Delete('orders/:id')
  @ApiOperation({ summary: 'Delete an order (Admin only)' })
  async deleteOrder(@Param('id') id: string) {
    return this.adminService.adminDeleteOrder(id);
  }

  // ─── Products Management ───────────────────────────

  /**
   * GET /admin/products/stats
   * Platform-wide product statistics
   */
  @Get('products/stats')
  @ApiOperation({ summary: 'Get product statistics (Admin only)' })
  async getProductStats() {
    return this.adminService.getProductStats();
  }

  /**
   * GET /admin/products/export
   * Export products as JSON (no pagination) for CSV generation
   */
  @Get('products/export')
  @ApiOperation({ summary: 'Export products (Admin only)' })
  async exportProducts(
    @Query('status') status?: string,
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.exportProducts({ status, storeId, startDate, endDate });
  }

  /**
   * GET /admin/products
   * Paginated products list with filters
   */
  @Get('products')
  @ApiOperation({ summary: 'Get paginated products list (Admin only)' })
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('storeId') storeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.adminService.getProducts({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status,
      storeId,
      categoryId,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
      startDate,
      endDate,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  /**
   * GET /admin/products/:id
   * Single product details
   */
  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details (Admin only)' })
  async getProductById(@Param('id') id: string) {
    return this.adminService.getProductById(id);
  }

  /**
   * PATCH /admin/products/:id/status
   * Update product status
   */
  @Patch('products/:id/status')
  @ApiOperation({ summary: 'Update product status (Admin only)' })
  async updateProductStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.adminService.adminUpdateProductStatus(id, body.status);
  }

  /**
   * PATCH /admin/products/:id/featured
   * Toggle product featured status
   */
  @Patch('products/:id/featured')
  @ApiOperation({ summary: 'Toggle product featured (Admin only)' })
  async toggleProductFeatured(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean },
  ) {
    return this.adminService.adminToggleProductFeatured(id, body.isFeatured);
  }

  /**
   * DELETE /admin/products/:id
   * Delete a product
   */
  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.adminDeleteProduct(id);
  }

  // ─── Verification Requests Management ──────────────

  /**
   * GET /admin/verification/stats
   */
  @Get('verification/stats')
  @ApiOperation({ summary: 'Get verification request statistics (Admin only)' })
  async getVerificationStats() {
    return this.adminService.getVerificationStats();
  }

  /**
   * GET /admin/verification/export
   */
  @Get('verification/export')
  @ApiOperation({ summary: 'Export verification requests (Admin only)' })
  async exportVerificationRequests(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.exportVerificationRequests({ status, type, startDate, endDate });
  }

  /**
   * GET /admin/verification
   * Paginated verification requests
   */
  @Get('verification')
  @ApiOperation({ summary: 'Get verification requests (Admin only)' })
  async getVerificationRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getVerificationRequests({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      type,
      search,
      startDate,
      endDate,
    });
  }

  /**
   * GET /admin/verification/:id
   */
  @Get('verification/:id')
  @ApiOperation({ summary: 'Get verification request detail (Admin only)' })
  async getVerificationRequestById(@Param('id') id: string) {
    return this.adminService.getVerificationRequestById(id);
  }

  /**
   * PATCH /admin/verification/:id
   * Approve or reject a verification request
   */
  @Patch('verification/:id')
  @ApiOperation({ summary: 'Review verification request (Admin only)' })
  async reviewVerificationRequest(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; adminNotes?: string; rejectionReason?: string },
    @Query('adminId') adminId?: string,
  ) {
    return this.adminService.reviewVerificationRequest(id, body);
  }
}

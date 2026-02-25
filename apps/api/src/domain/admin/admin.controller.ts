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

  /**
   * GET /admin/users
   * Paginated user list
   */
  @Get('users')
  @ApiOperation({ summary: 'Get paginated user list (Admin only)' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getRecentUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
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
}

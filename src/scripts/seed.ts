import mongoose from 'mongoose';
import { config } from '../infrastructure/config';
import { PermissionModel } from '../infrastructure/database/mongoose/models/PermissionModel';
import { RoleModel } from '../infrastructure/database/mongoose/models/RoleModel';
import { UserModel } from '../infrastructure/database/mongoose/models/UserModel';
import { hashPassword } from '../shared/utils/password';

/**
 * Database Seeder
 * Creates initial permissions, roles, and admin user
 */
const seed = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seed...');

    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out for production)
    await Promise.all([
      PermissionModel.deleteMany({}),
      RoleModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ============================================
    // Create Permissions
    // ============================================
    const resources = ['users', 'roles', 'permissions', 'audit-logs'];
    const actions = ['create', 'read', 'update', 'delete', 'manage'];

    const permissionDocs = [];

    for (const resource of resources) {
      for (const action of actions) {
        permissionDocs.push({
          name: `${resource}:${action}`,
          resource,
          action,
          description: `Can ${action} ${resource}`,
        });
      }
    }

    const permissions = await PermissionModel.insertMany(permissionDocs);
    console.log(`✅ Created ${permissions.length} permissions`);

    // ============================================
    // Create Roles
    // ============================================

    // Admin role - has all permissions
    const adminRole = await RoleModel.create({
      name: 'admin',
      description: 'Full system administrator with all permissions',
      permissionIds: permissions.map((p) => p._id),
      isSystem: true,
    });
    console.log('✅ Created admin role');

    // Manager role - can manage users and view audit logs
    const managerPermissions = permissions.filter(
      (p) =>
        (p.resource === 'users' && ['create', 'read', 'update'].includes(p.action)) ||
        (p.resource === 'audit-logs' && p.action === 'read') ||
        (p.resource === 'roles' && p.action === 'read')
    );

    const managerRole = await RoleModel.create({
      name: 'manager',
      description: 'Can manage users and view audit logs',
      permissionIds: managerPermissions.map((p) => p._id),
      isSystem: false,
    });
    console.log('✅ Created manager role');

    // Viewer role - read-only access
    const viewerPermissions = permissions.filter((p) => p.action === 'read');

    const viewerRole = await RoleModel.create({
      name: 'viewer',
      description: 'Read-only access to all resources',
      permissionIds: viewerPermissions.map((p) => p._id),
      isSystem: false,
    });
    console.log('✅ Created viewer role');

    // ============================================
    // Create Admin User
    // ============================================
    const hashedPassword = await hashPassword('Admin@123');

    await UserModel.create({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      roleId: adminRole._id,
      isActive: true,
    });
    console.log('✅ Created admin user');

    // Create a test manager user
    await UserModel.create({
      email: 'manager@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Manager',
      roleId: managerRole._id,
      isActive: true,
    });
    console.log('✅ Created manager user');

    // Create a test viewer user
    await UserModel.create({
      email: 'viewer@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Viewer',
      roleId: viewerRole._id,
      isActive: true,
    });
    console.log('✅ Created viewer user');

    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎉 Database seeding completed successfully!              ║
║                                                            ║
║   Default Users:                                           ║
║   ─────────────────────────────────────────────────────    ║
║   Admin:   admin@example.com   / Admin@123                 ║
║   Manager: manager@example.com / Admin@123                 ║
║   Viewer:  viewer@example.com  / Admin@123                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();

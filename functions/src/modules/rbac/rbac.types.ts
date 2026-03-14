export type Role = 'owner' | 'admin' | 'editor' | 'media_manager' | 'inbox_viewer'

export type Permission =
  | 'events.create'
  | 'events.edit'
  | 'events.publish'
  | 'events.archive'
  | 'posts.create'
  | 'posts.edit'
  | 'posts.publish'
  | 'posts.archive'
  | 'announcements.create'
  | 'announcements.edit'
  | 'announcements.publish'
  | 'announcements.archive'
  | 'pages.edit'
  | 'homeBlocks.edit'
  | 'partners.create'
  | 'partners.edit'
  | 'media.upload'
  | 'contact.read'
  | 'audit.read'
  | 'versions.read'
  | 'versions.restore'
  | 'adminUsers.manage'
  | 'system.rebuild'

export interface RoleDefinition {
  name: Role
  permissions: Record<Permission, boolean>
}

export interface AdminUser {
  uid: string
  name: string
  email: string
  role: Role
  status: 'active' | 'inactive'
  lastLoginAt?: FirebaseFirestore.Timestamp
  createdAt: FirebaseFirestore.Timestamp
  createdBy?: {
    uid: string
    name: string
  }
}

export interface AuthenticatedUser {
  uid: string
  name: string
  email: string
  role: Role
}

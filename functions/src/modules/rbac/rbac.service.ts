import { getFirestore } from 'firebase-admin/firestore'
import type { Permission, Role, RoleDefinition } from './rbac.types'

const rolesCache = new Map<Role, RoleDefinition>()

export async function getRoleDefinition(role: Role): Promise<RoleDefinition | null> {
  if (rolesCache.has(role)) {
    return rolesCache.get(role)!
  }

  const db = getFirestore()
  const doc = await db.collection('roles').doc(role).get()

  if (!doc.exists) {
    return null
  }

  const definition = doc.data() as RoleDefinition
  rolesCache.set(role, definition)

  return definition
}

export async function hasPermission(role: Role, permission: Permission): Promise<boolean> {
  if (role === 'owner') return true

  const definition = await getRoleDefinition(role)

  if (!definition) return false

  return definition.permissions[permission] === true
}

export function clearRolesCache(): void {
  rolesCache.clear()
}

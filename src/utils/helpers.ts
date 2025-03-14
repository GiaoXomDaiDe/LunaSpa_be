import { ResourcePermission } from '~/models/schema/Role.schema'

export const isResourcePermissionChanged = (oldPermission: ResourcePermission, newPermission: ResourcePermission) => {
  return (
    oldPermission.create !== newPermission.create ||
    oldPermission.read !== newPermission.read ||
    oldPermission.update !== newPermission.update ||
    oldPermission.delete !== newPermission.delete
  )
}

export const isRoleChanged = (oldRole: any, newRole: any) => {
  // So sánh name
  if (oldRole.name !== newRole.name) {
    return true
  }

  // So sánh resources array
  const oldResources = oldRole.resources || []
  const newResources = newRole.resources || []

  // Kiểm tra số lượng resources
  if (oldResources.length !== newResources.length) {
    return true
  }

  // So sánh từng resource permission
  for (let i = 0; i < oldResources.length; i++) {
    const oldResource = oldResources[i]
    const newResource = newResources.find(
      (r: ResourcePermission) => r.resource_id?.toString() === oldResource.resource_id?.toString()
    )

    // Nếu không tìm thấy resource tương ứng hoặc permissions thay đổi
    if (!newResource || isResourcePermissionChanged(oldResource, newResource)) {
      return true
    }
  }

  return false
}

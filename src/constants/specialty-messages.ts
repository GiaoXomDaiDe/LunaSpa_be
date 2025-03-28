export const SPECIALTY_MESSAGES = {
  GET_ALL_SPECIALTIES_SUCCESS: 'Get all specialties successfully',
  GET_SPECIALTY_SUCCESS: 'Get specialty successfully',
  GET_SPECIALTY_DEVICES_SUCCESS: 'Get devices by specialty successfully',
  GET_SPECIALTY_SERVICES_SUCCESS: 'Get services by specialty successfully',
  CREATE_SPECIALTY_SUCCESS: 'Create specialty successfully',
  CREATE_SPECIALTY_FAILED: 'Failed to create specialty',
  UPDATE_SPECIALTY_SUCCESS: 'Update specialty successfully',
  UPDATE_SPECIALTY_FAILED: 'Failed to update specialty',
  DELETE_SPECIALTY_SUCCESS: 'Delete specialty successfully',

  SPECIALTY_NOT_FOUND: 'Specialty not found',

  NAME_REQUIRED: 'Specialty name is required',
  NAME_MUST_BE_STRING: 'Specialty name must be a string',
  NAME_LENGTH: 'Specialty name must be between 1 and 100 characters',
  DESCRIPTION_REQUIRED: 'Description is required',
  DESCRIPTION_MUST_BE_STRING: 'Description must be a string',
  DEVICE_IDS_MUST_BE_ARRAY: 'Device IDs must be an array',
  DEVICE_ID_MUST_BE_MONGO_ID: 'Device ID must be a valid MongoDB ID',
  SERVICE_IDS_MUST_BE_ARRAY: 'Service IDs must be an array',
  SERVICE_ID_MUST_BE_MONGO_ID: 'Service ID must be a valid MongoDB ID'
} as const

import { API_URL, handleApiError } from '../config';
import type { MetadataField } from '../types';

/**
 * Get available legal tags
 */
export async function getLegalTags(session?: any): Promise<string[]> {
  try {
    console.log('Fetching legal tags from:', `${API_URL}/api/v1/legal-tags`);
    
    const response = await fetch(`${API_URL}/api/v1/legal-tags`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw legal tags response:', apiResponse);
    
    // Handle the actual API response format: {data: [...], status: "success"}
    if (apiResponse.status === 'success' && apiResponse.data) {
      // Extract tags from the array
      const tags: string[] = apiResponse.data.map((item: any) => item.tag);
      
      console.log('Converted legal tags:', tags);
      return tags;
    } else {
      throw new Error('Failed to get legal tags - invalid response format');
    }
  } catch (error) {
    console.error('Error fetching legal tags:', error);
    return handleApiError(error, 'get legal tags');
  }
}

/**
 * Get metadata field values with optional prefix filtering
 */
export async function getMetadataFieldValues(
  field: string, 
  prefix?: string, 
  size: number = 20, 
  session?: any
): Promise<string[]> {
  try {
    const params = new URLSearchParams({ 
      search: prefix || '',
      limit: size.toString()
    });
    
    const url = `${API_URL}/api/v1/metadata-fields/${field}?${params}`;
    console.log('Fetching metadata field values from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw metadata field values response:', apiResponse);
    
    if (apiResponse.data) {
      const values = apiResponse.data.values.map(item => item.value);
      console.log('Converted metadata field values:', values);
      return values;
    } else {
      console.error('Invalid metadata field values response format:', apiResponse);
      throw new Error('Failed to get metadata field values - response missing data field');
    }
  } catch (error) {
    console.error('Error fetching metadata field values:', error);
    return handleApiError(error, 'get metadata field values');
  }
}

/**
 * Get all field options for search filters
 */
export async function getAllFieldOptions(session?: any): Promise<Record<string, string[]>> {
  try {
    console.log('Fetching field options from:', `${API_URL}/api/v1/field-options`);
    
    const response = await fetch(`${API_URL}/api/v1/field-options`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw field options response:', apiResponse);
    
    // Handle the actual API response format: {data: {...}} (no success wrapper)
    const data = apiResponse.data ?? apiResponse; // accept wrapped or raw
    if (data) {
      const fieldOptions: Record<string, string[]> = {};
      
      // Convert the structured response to simple string arrays
      if (data.doc_types) {
        fieldOptions['doc_type'] = data.doc_types.map((item: any) => item.value);
      }
      if (data.legal_tags) {
        fieldOptions['legal_tags'] = data.legal_tags.map((item: any) => item.value);
      }
      if (data.courts) {
        fieldOptions['court'] = data.courts.map((item: any) => item.value);
      }
      if (data.judges) {
        fieldOptions['judge'] = data.judges.map((item: any) => item.value);
      }
      if (data.statuses) {
        fieldOptions['status'] = data.statuses.map((item: any) => item.value);
      }
      if (data.authors) {
        fieldOptions['author'] = data.authors.map((item: any) => item.value);
      }
      
      console.log('Converted field options:', fieldOptions);
      return fieldOptions;
    } else {
      console.error('Invalid field options response format:', apiResponse);
      throw new Error('Failed to get field options - response missing data field');
    }
  } catch (error) {
    console.error('Error fetching field options:', error);
    return handleApiError(error, 'get field options');
  }
}

/**
 * Get available metadata fields
 */
export async function getMetadataFields(session?: any): Promise<{ fields: MetadataField[] }> {
  try {
    console.log('Fetching metadata fields from:', `${API_URL}/api/v1/metadata-fields`);
    
    const response = await fetch(`${API_URL}/api/v1/metadata-fields`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    console.log('Raw metadata fields response:', apiResponse);
    
    // Handle the actual API response format: {data: {...}} (no success wrapper)
    if (apiResponse.data) {
      const fields = apiResponse.data.fields || [];
      console.log('Converted metadata fields:', fields);
      return { fields };
    } else {
      console.error('Invalid metadata fields response format:', apiResponse);
      throw new Error('Failed to get metadata fields - response missing data field');
    }
  } catch (error) {
    console.error('Error fetching metadata fields:', error);
    return handleApiError(error, 'get metadata fields');
  }
}
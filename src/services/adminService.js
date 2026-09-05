import { deleteCloudinaryAsset } from './cloudinaryService';
import { firebaseConfig } from '../firebase/config';

/**
 * REST / Direct Firestore Operations for Admin Portfolio Management
 */

const getFirestoreBaseUrl = () => {
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
};

/**
 * Format project object into Firestore Document fields format
 */
const toFirestoreDoc = (project) => {
  return {
    fields: {
      title: { stringValue: project.title || '' },
      description: { stringValue: project.description || '' },
      category: { stringValue: project.category || 'apps' },
      domain: { stringValue: project.domain || '' },
      liveUrl: { stringValue: project.liveUrl || '' },
      gitHubUrl: { stringValue: project.gitHubUrl || '' },
      isFeatured: { booleanValue: !!project.isFeatured },
      displayOrder: { integerValue: String(project.displayOrder || 0) },
      technologies: {
        arrayValue: {
          values: (project.technologies || []).map(t => ({ stringValue: t }))
        }
      },
      thumbnail: {
        mapValue: {
          fields: {
            imageUrl: { stringValue: project.thumbnail?.imageUrl || '' },
            publicId: { stringValue: project.thumbnail?.publicId || '' }
          }
        }
      },
      screenshots: {
        arrayValue: {
          values: (project.screenshots || []).map(s => ({
            mapValue: {
              fields: {
                imageUrl: { stringValue: s.imageUrl || '' },
                publicId: { stringValue: s.publicId || '' }
              }
            }
          }))
        }
      },
      updatedAt: { stringValue: new Date().toISOString() }
    }
  };
};

/**
 * Parse Firestore Document fields to JS Object
 */
export const parseFirestoreProject = (doc) => {
  if (!doc) return null;
  const nameParts = doc.name ? doc.name.split('/') : [];
  const id = nameParts.length > 0 ? nameParts[nameParts.length - 1] : doc.id;
  const fields = doc.fields || {};

  return {
    id,
    title: fields.title?.stringValue || '',
    description: fields.description?.stringValue || '',
    category: fields.category?.stringValue || 'apps',
    domain: fields.domain?.stringValue || '',
    liveUrl: fields.liveUrl?.stringValue || '',
    gitHubUrl: fields.gitHubUrl?.stringValue || '',
    isFeatured: fields.isFeatured?.booleanValue || false,
    displayOrder: parseInt(fields.displayOrder?.integerValue || '0', 10),
    technologies: (fields.technologies?.arrayValue?.values || []).map(v => v.stringValue),
    thumbnail: {
      imageUrl: fields.thumbnail?.mapValue?.fields?.imageUrl?.stringValue || '',
      publicId: fields.thumbnail?.mapValue?.fields?.publicId?.stringValue || ''
    },
    screenshots: (fields.screenshots?.arrayValue?.values || []).map(v => ({
      imageUrl: v.mapValue?.fields?.imageUrl?.stringValue || '',
      publicId: v.mapValue?.fields?.publicId?.stringValue || ''
    }))
  };
};

/**
 * Create a new Project in Firestore
 */
export const createProject = async (projectData, idToken) => {
  const url = `${getFirestoreBaseUrl()}/portfolio`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify(toFirestoreDoc(projectData))
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to save project record to Firestore');
  }

  const result = await response.json();
  return parseFirestoreProject(result);
};

/**
 * Update Project with Asset Replacement Purging
 */
export const updateProject = async (projectId, projectData, oldProjectData, idToken) => {
  // If thumbnail changed, purge old thumbnail from Cloudinary
  if (oldProjectData?.thumbnail?.publicId && 
      oldProjectData.thumbnail.publicId !== projectData?.thumbnail?.publicId) {
    await deleteCloudinaryAsset(oldProjectData.thumbnail.publicId, idToken);
  }

  const url = `${getFirestoreBaseUrl()}/portfolio/${projectId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify(toFirestoreDoc(projectData))
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update project record in Firestore');
  }

  const result = await response.json();
  return parseFirestoreProject(result);
};

/**
 * Delete Project with Cascade Deletion of all linked Cloudinary Assets
 */
export const deleteProject = async (projectId, projectData, idToken) => {
  // 1. Cascade-delete thumbnail asset
  if (projectData?.thumbnail?.publicId) {
    await deleteCloudinaryAsset(projectData.thumbnail.publicId, idToken);
  }

  // 2. Cascade-delete all screenshot assets
  if (Array.isArray(projectData?.screenshots)) {
    for (const ss of projectData.screenshots) {
      if (ss?.publicId) {
        await deleteCloudinaryAsset(ss.publicId, idToken);
      }
    }
  }

  // 3. Delete Firestore Document
  const url = `${getFirestoreBaseUrl()}/portfolio/${projectId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete project record from Firestore');
  }

  return true;
};

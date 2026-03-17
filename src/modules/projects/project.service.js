import Project from "./project.model.js";
import ApiError from "../../utils/ApiError.js";
import { PROJECT_STATUS } from "../../constants/projectStatus.js";
import ApiFeatures from "../../utils/ApiFeatures.js";
import { uploadToCloudinary } from "../../utils/upload.js";
import { v2 as cloudinary } from "cloudinary";

// ── Create Project ────────────────────────────────────────
export const createProject = async (clientId, data, files = []) => {
  // Upload image first
  let uploadedImage = null;
  if (files.length > 0) {
    uploadedImage = await uploadProjectImages(null, files); // Single image
  } else {
    // If no image provided, image field is required - throw error
    throw ApiError.badRequest("Project image is required");
  }

  // Create project with image
  const projectData = {
    ...data,
    client: clientId,
    image: uploadedImage,
  };

  const project = await Project.create(projectData);
  return project;
};

// ── Upload Project Images ────────────────────────────────
export const uploadProjectImages = async (projectId, files) => {
  if (files.length === 0) return null;
  
  const file = files[0]; // Single image
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const publicId = `project-${projectId || 'new'}-${uniqueSuffix}`;
  
  const result = await uploadToCloudinary(file.buffer, "allabina/projects", publicId);
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: file.originalname,
  };
};

// ── Delete Project Image ─────────────────────────────────
export const deleteProjectImage = async (projectId, publicId) => {
  // Delete from Cloudinary
  await cloudinary.uploader.destroy(publicId);
  
  // Remove from project (set to null for single image)
  await Project.findByIdAndUpdate(
    projectId,
    { $pull: { images: { publicId } } }
  );
};
 
// ── Get All Projects (Public) ─────────────────────────────
export const getAllProjects = async (query) => {
  // Base filter: only show open/active projects
  const baseFilter = {
    status: { $in: [PROJECT_STATUS.OPEN, PROJECT_STATUS.IN_PROGRESS] },
    isActive: true,
  };

  const features = new ApiFeatures(
    Project.find(baseFilter).populate("client", "name"),
    query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [projects, total] = await Promise.all([
    features.query,
    Project.countDocuments(baseFilter),
  ]);

  return {
    projects,
    pagination: {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      total,
      pages: Math.ceil(total / (parseInt(query.limit, 10) || 10)),
    },
  };
};

// ── Search Projects ───────────────────────────────────────
export const searchProjects = async (query) => {
  const searchQuery = query.q || query.search || "";
  
  if (!searchQuery.trim()) {
    throw ApiError.badRequest("Search query is required");
  }

  const baseFilter = {
    status: { $in: [PROJECT_STATUS.OPEN, PROJECT_STATUS.IN_PROGRESS] },
    isActive: true,
    $text: { $search: searchQuery },
  };

  const features = new ApiFeatures(
    Project.find(baseFilter).populate("client", "name"),
    query
  )
    .sort()
    .limitFields()
    .paginate();

  const [projects, total] = await Promise.all([
    features.query,
    Project.countDocuments(baseFilter),
  ]);

  return {
    projects,
    pagination: {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      total,
      pages: Math.ceil(total / (parseInt(query.limit, 10) || 10)),
    },
  };
};

// ── Get Project by ID ─────────────────────────────────────
export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId).populate(
    "client",
    "name"
  );

  if (!project) throw ApiError.notFound("Project not found");

  // Increment views
  project.views += 1;
  await project.save({ validateBeforeSave: false });

  return project;
};

// ── Get My Projects (Client) ──────────────────────────────
export const getMyProjects = async (clientId, query) => {
  const baseFilter = { client: clientId };

  if (query.status) {
    const statuses = query.status.split(",");
    baseFilter.status = { $in: statuses };
  }

  const features = new ApiFeatures(
    Project.find(baseFilter).populate("freelancer", "name"),
    query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [projects, total] = await Promise.all([
    features.query,
    Project.countDocuments(baseFilter),
  ]);

  return {
    projects,
    pagination: {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      total,
      pages: Math.ceil(total / (parseInt(query.limit, 10) || 10)),
    },
  };
};

// ── Update Project ────────────────────────────────────────
export const updateProject = async (clientId, projectId, data, files = [], imagesToDelete = []) => {
  const session = await Project.startSession();
  
  try {
    await session.withTransaction(async () => {
      const project = await Project.findOne({
        _id: projectId,
        client: clientId,
      }).session(session);

      if (!project) throw ApiError.notFound("Project not found");

      // Only allow updates for open projects
      if (project.status !== PROJECT_STATUS.OPEN) {
        throw ApiError.badRequest("Cannot update project that is in progress or completed");
      }

      // Delete specified images from Cloudinary and project
      if (imagesToDelete.length > 0) {
        // First delete from Cloudinary
        const deletePromises = imagesToDelete.map(publicId => 
          cloudinary.uploader.destroy(publicId)
        );
        await Promise.all(deletePromises);
        
        // Then remove from project
        await Project.findByIdAndUpdate(
          projectId,
          { $pull: { images: { publicId: { $in: imagesToDelete } } } },
          { session }
        );
      }

      // Upload new images if provided
      if (files.length > 0) {
        const newImages = await uploadProjectImages(projectId, files);
        
        // Add to project
        await Project.findByIdAndUpdate(
          projectId,
          { $push: { images: { $each: newImages } } },
          { session }
        );
      }

      // Prevent changing sensitive fields
      delete data.client;
      delete data.freelancer;
      delete data.proposalsCount;
      delete data.views;
      delete data.status;
      delete data.images; // Images handled separately

      // Update other fields
      if (Object.keys(data).length > 0) {
        await Project.findByIdAndUpdate(
          projectId,
          data,
          { session, runValidators: true }
        );
      }
    });

    // Return updated project
    const updatedProject = await Project.findById(projectId).populate("client", "name");
    return updatedProject;
    
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

// ── Delete Project with Image Cleanup ───────────────────
export const deleteProject = async (clientId, projectId) => {
  const session = await Project.startSession();
  
  try {
    await session.withTransaction(async () => {
      const project = await Project.findOne({
        _id: projectId,
        client: clientId,
      }).session(session);

      if (!project) throw ApiError.notFound("Project not found");

      // Only projects without assigned freelancer can be deleted
      if (project.status === PROJECT_STATUS.IN_PROGRESS) {
        throw ApiError.badRequest("Cannot delete project that is in progress");
      }

      // Delete image from Cloudinary if project is being deleted
      if (project.image && project.image.publicId) {
        await cloudinary.uploader.destroy(project.image.publicId);
      }

      // Delete project from database
      await Project.findByIdAndDelete(projectId).session(session);
    });
    
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

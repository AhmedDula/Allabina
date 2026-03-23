import Project from "./project.model.js";
import ApiError from "../../utils/ApiError.js";
import { PROJECT_STATUS } from "../../constants/projectStatus.js";
import ApiFeatures from "../../utils/ApiFeatures.js";
import { uploadToCloudinary } from "../../utils/upload.js";
import { v2 as cloudinary } from "cloudinary";



// ── Upload Project Images ────────────────────────────────
export const uploadProjectImages = async (projectId, files) => {
  if (files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const publicId = `project-${projectId || 'new'}-${uniqueSuffix}`;

    const result = await uploadToCloudinary(file.buffer, "allabina/projects", publicId);
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };  
  });

  return await Promise.all(uploadPromises);
};


// ── Filter Files ─────────────────────────────────────────
const filterFiles = (files) => {
   const allowedImages = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
   const allowedAttachments = ["application/pdf", "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
   const images = files.filter((file) => allowedImages.includes(file.mimetype));
   const attachments = files.filter((file) => allowedAttachments.includes(file.mimetype));
   return { images, attachments };
}

// ── Upload Attachments ───────────────────────────────────
export const uploadAttachments = async (projectId, files) => {
  if (files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const publicId = `project-${projectId}-attachment-${uniqueSuffix}`;
    const result = await uploadToCloudinary(
      file.buffer,
      `allabina/projects/${projectId}/attachments`,
      publicId,
      "raw"
    );
    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
    };
  });
  return await Promise.all(uploadPromises);
};


// ── Create Project ────────────────────────────────────────
export const createProject = async (clientId, data, files = []) => {
  // Upload image first
  let uploadedImages = [];
  let uploadedAttachments = [];
  let {images , attachments} = filterFiles(files)
  
  if (images.length > 0) {
    uploadedImages = await uploadProjectImages(null, images);
    if (attachments.length > 0) {
      uploadedAttachments = await uploadAttachments(null, attachments);
    }
  } else {
    throw ApiError.badRequest("Project image is required");
  }
  let imagesUrls = uploadedImages.map(img => img.url)
  let attachmentsUrls = uploadedAttachments.map(att => att.url)
  data.budget = JSON.parse(data.budget)
  // Create project with image
  const projectData = {
    ...data,
    clientId: clientId,
    images: imagesUrls,
    attachments: attachmentsUrls,
  };

  const project = await Project.create(projectData);
  return project;
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
  };

  const features = new ApiFeatures(
    Project.find(baseFilter).populate("clientId", "name"),
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
  const filter = {
    status: { $in: [PROJECT_STATUS.OPEN, PROJECT_STATUS.IN_PROGRESS] },
  };

  // Filter by category
  if (query.category) {
    const categories = query.category.split(",").map(c => c.trim());
    filter.categories = { $in: categories };
  }

  // Filter by skill
  if (query.skill) {
    const skills = query.skill.split(",").map(s => s.trim());
    filter.skills = { $in: skills }; 
  }

  const features = new ApiFeatures(
    Project.find(filter).populate("clientId", "name"),
    query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [projects, total] = await Promise.all([
    features.query,
    Project.countDocuments(filter),
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
    "clientId",
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
  const baseFilter = { clientId: clientId };

  if (query.status) {
    const statuses = query.status.split(",");
    baseFilter.status = { $in: statuses };
  }

  const features = new ApiFeatures(
    Project.find(baseFilter).populate("clientId", "name"),
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



export const updateProject = async (clientId, projectId, data, files = [], imagesToDelete = [], attachmentsToDelete = []) => {
  let newImages = [];
  let newAttachments = [];
  let updatedProject = null;
  const { images, attachments } = filterFiles(files);

  if (images.length > 0) {
    newImages = await uploadProjectImages(projectId, images);
  }

  if (attachments.length > 0) {
    newAttachments = await uploadAttachments(projectId, attachments);
  }

  const session = await Project.startSession();

  try {
    await session.withTransaction(async () => {
      const project = await Project.findOne({
        _id: projectId,
        clientId: clientId,
      }).session(session);

      if (!project) throw ApiError.notFound("Project not found");

      if (project.status !== PROJECT_STATUS.OPEN) {
        throw ApiError.badRequest("Cannot update project that is in progress or completed");
      }

      await Promise.all([
        ...imagesToDelete.map(id => cloudinary.uploader.destroy(id)),
        ...attachmentsToDelete.map(id => cloudinary.uploader.destroy(id)),
      ]);
     
      const updateQuery = {};


      if (imagesToDelete.length > 0 || attachmentsToDelete.length > 0) {
       updateQuery.$pull = {
        ...(imagesToDelete.length > 0 && { images: { $in: imagesToDelete } }),
        ...(attachmentsToDelete.length > 0 && { attachments: { $in: attachmentsToDelete } }), 
      };
      }

      if (newImages.length > 0 || newAttachments.length > 0) {
        updateQuery.$push = {
          ...(newImages.length > 0 && { images: { $each: newImages.map(img => img.url) } }),
          ...(newAttachments.length > 0 && { attachments: { $each: newAttachments.map(att => att.url) } }),
        };
      }

      ["clientId", "status", "images", "attachments"].forEach(field => delete data[field]);

      if (Object.keys(data).length > 0) {
        updateQuery.$set = data;
      }

      
   
      if (Object.keys(updateQuery).length > 0) {
        updatedProject = await Project.findByIdAndUpdate(projectId, updateQuery, {
          session,
          runValidators: true,
          new: true,
        }).populate("clientId", "name");
      }
    });

    return updatedProject;

  } catch (error) {
    await Promise.all([
      ...newImages.map(img => cloudinary.uploader.destroy(img.publicId)),
      ...newAttachments.map(att => cloudinary.uploader.destroy(att.publicId)),
    ]);
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
        clientId: clientId,
      }).session(session);

      if (!project) throw ApiError.notFound("Project not found");

      if (project.status === PROJECT_STATUS.IN_PROGRESS) {
        throw ApiError.badRequest("Cannot delete project that is in progress");
      }

      if (project.image && project.image.publicId) {
        await cloudinary.uploader.destroy(project.image.publicId);
      }
      await Project.findByIdAndDelete(projectId).session(session);
    });
    
  } catch (error) {
    await session.rollbackTransaction();
    throw error;
  } finally {
    await session.endSession()
  }
};



import asyncHandler from "../../middlewares/asyncHandler.js";
import * as projectService from "./project.service.js";
import upload from "../../utils/upload.js";

// ── POST /api/projects ──────────────────────────────────
// Create new project (with optional images)
export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(
    req.user.id, 
    req.body, 
    req.files || []
  );

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: { project },
  });
});

// ── GET /api/projects ───────────────────────────────────
// Get all projects (public)
export const getAllProjects = asyncHandler(async (req, res) => {
  const { projects, pagination } = await projectService.getAllProjects(req.query);

  res.status(200).json({
    success: true,
    pagination,
    data: { projects },
  });
});

// ── GET /api/projects/search ────────────────────────────
// Search projects by text
export const searchProjects = asyncHandler(async (req, res) => {
  const { projects, pagination } = await projectService.searchProjects(req.query);

  res.status(200).json({
    success: true,
    pagination,
    data: { projects },
  });
});

// ── GET /api/projects/:id ───────────────────────────────
// Get single project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);

  res.status(200).json({
    success: true,
    data: { project },
  });
});

// ── GET /api/projects/me ────────────────────────────────
// Get my projects (as client)
export const getMyProjects = asyncHandler(async (req, res) => {
  const { projects, pagination } = await projectService.getMyProjects(
    req.user.id,
    req.query
  );

  res.status(200).json({
    success: true,
    pagination,
    data: { projects },
  });
});

// ── PATCH /api/projects/:id ─────────────────────────────
// Update project (with optional images)
export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.user.id,
    req.params.id,
    req.body,
    req.files || [],
    req.body?.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : [],
    req.body?.attachmentsToDelete ? JSON.parse(req.body.attachmentsToDelete) : []
  );

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: { project },
  });
});

// ── DELETE /api/projects/:id ────────────────────────────
// Delete project
export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});

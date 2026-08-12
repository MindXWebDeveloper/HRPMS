import { COMMENTS } from "../assets/js/common/storageKeys.js";

function getAllComments() {
  try {
    const raw = localStorage.getItem(COMMENTS);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((comment) => normalizeComment(comment)).filter(Boolean);
  } catch {
    return [];
  }
}

function saveComments(comments) {
  const normalized = Array.isArray(comments)
    ? comments.map((comment) => normalizeComment(comment)).filter(Boolean)
    : [];

  localStorage.setItem(COMMENTS, JSON.stringify(normalized));
}

function getCommentsByTaskId(taskId) {
  const normalizedTaskId = String(taskId || "").trim();

  if (!normalizedTaskId) {
    return [];
  }

  return getAllComments()
    .filter((comment) => comment.taskId === normalizedTaskId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function insertComment(commentInput) {
  const record = normalizeComment(commentInput);

  if (!record || !record.taskId || !record.employeeID || !record.content) {
    return null;
  }

  const comments = getAllComments();
  comments.push(record);
  saveComments(comments);

  return record;
}

function deleteComment(commentId) {
  const normalizedId = String(commentId || "").trim();

  if (!normalizedId) {
    return false;
  }

  const comments = getAllComments();
  const nextComments = comments.filter(
    (comment) =>
      comment.id !== normalizedId &&
      comment.parentCommentId !== normalizedId &&
      comment.childCommentId !== normalizedId,
  );

  if (nextComments.length === comments.length) {
    return false;
  }

  saveComments(nextComments);
  return true;
}

function normalizeComment(commentInput) {
  if (!commentInput || typeof commentInput !== "object") {
    return null;
  }

  const now = new Date().toISOString();
  const id = String(commentInput.id || `cmt-${Date.now()}-${Math.floor(Math.random() * 10000)}`).trim();
  const taskId = String(commentInput.taskId || "").trim();
  const employeeID = String(
    commentInput.employeeID || commentInput.employeeCode || "",
  ).trim();
  const content = String(commentInput.content || "").trim();
  const parentCommentId = String(commentInput.parentCommentId || commentInput.childCommentId || "").trim();

  if (!id || !taskId || !employeeID || !content) {
    return null;
  }

  return {
    id,
    taskId,
    employeeID,
    content,
    parentCommentId: parentCommentId || null,
    childCommentId: parentCommentId || null,
    createdAt: String(commentInput.createdAt || now),
    updatedAt: String(commentInput.updatedAt || commentInput.createdAt || now),
  };
}

export {
  getAllComments,
  saveComments,
  getCommentsByTaskId,
  insertComment,
  deleteComment,
};

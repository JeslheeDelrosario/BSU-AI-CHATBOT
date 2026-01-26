// server/src/routes/classroom.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadJoinRequestFiles, uploadPostAttachments } from '../middleware/upload.middleware';
import { uploadPostImages } from '../middleware/image-upload.middleware';
import * as classroomController from '../controllers/classroom.controller';
import * as postController from '../controllers/classroom-post.controller';
import * as commentController from '../controllers/classroom-comment.controller';
import * as assignmentController from '../controllers/classroom-assignment.controller';
import * as joinRequestController from '../controllers/classroom-join-request.controller';
import classroomMeetingRoutes from './classroomMeeting.routes';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Classroom management
router.get('/', classroomController.getUserClassrooms);
router.get('/browse/all', classroomController.getAllClassrooms);
router.post('/', classroomController.createClassroom);
router.get('/:id', classroomController.getClassroom);
router.put('/:id', classroomController.updateClassroom);
router.post('/join', classroomController.joinClassroom);
router.post('/:id/members', classroomController.addMember);
router.delete('/:id/members/:memberId', classroomController.removeMember);

// Join requests (with file upload support)
router.post('/join-requests', uploadJoinRequestFiles.array('files', 3), joinRequestController.createJoinRequest);
router.get('/:classroomId/join-requests', joinRequestController.getClassroomJoinRequests);
router.put('/join-requests/:requestId/review', joinRequestController.reviewJoinRequest);

// Role management
router.put('/:classroomId/members/:memberId/role', joinRequestController.updateMemberRole);

// Classroom info
router.put('/:classroomId/info', joinRequestController.updateClassroomInfo);

// Posts
router.get('/:classroomId/posts', postController.getClassroomPosts);
router.post('/:classroomId/posts', (req, res, next) => {
  const multer = require('multer');
  const upload = multer({ storage: multer.memoryStorage() }).fields([
    { name: 'images', maxCount: 5 },
    { name: 'attachments', maxCount: 5 }
  ]);
  upload(req, res, next);
}, postController.createPost);
router.get('/posts/:id', postController.getPost);
router.put('/posts/:id', postController.updatePost);
router.delete('/posts/:id', postController.deletePost);
router.post('/posts/:id/reactions', postController.addReaction);

// Comments
router.get('/posts/:postId/comments', commentController.getComments);
router.post('/posts/:postId/comments', commentController.createComment);
router.put('/comments/:id', commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);
router.post('/comments/:id/reactions', commentController.addCommentReaction);

// Assignments
router.post('/assignments/:assignmentId/submit', assignmentController.submitAssignment);
router.get('/assignments/:assignmentId/my-submission', assignmentController.getMySubmission);
router.get('/assignments/:assignmentId/submissions', assignmentController.getAssignmentSubmissions);
router.post('/submissions/:id/grade', assignmentController.gradeSubmission);
router.post('/submissions/:id/return', assignmentController.returnSubmission);

// Classroom Meetings (Calendar)
router.use('/:classroomId/meetings', classroomMeetingRoutes);

export default router;

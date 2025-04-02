import express from 'express';
import {
  getAllArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
  getArtistsByGenre,
} from '../controllers/artist.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import { createArtistSchema, updateArtistSchema } from '../validations/artist.validation';
import { UserRole } from '../types/custom.types';

const router = express.Router();

// Public routes
router.get('/', getAllArtists);
router.get('/:id', getArtist);
router.get('/genre/:genre', getArtistsByGenre);

// Protected routes
router.use(protect);

router.post(
  '/',
  restrictTo(UserRole.ARTIST, UserRole.ADMIN),
  validationMiddleware(createArtistSchema, 'body'),
  createArtist
);

router.patch(
  '/:id', 
  restrictTo(UserRole.ARTIST, UserRole.ADMIN),
  validationMiddleware(updateArtistSchema, 'body'),
  updateArtist
);

router.delete('/:id', restrictTo(UserRole.ADMIN), deleteArtist);

export const artistRoutes = router; 
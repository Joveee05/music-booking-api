import { Request, Response, NextFunction } from 'express';
import artistService from '../services/artist.service'

export const getAllArtists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const artists = await artistService.getAllArtists({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });
    res.json(artists);
  } catch (error) {
    next(error);
  }
};

export const getArtist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const artist = await artistService.getArtist(req.params.id);
    res.status(<number>artist.statusCode).json(artist);
  } catch (error) {
    next(error);
  }
};

export const createArtist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const artist = await artistService.createArtist(req.body, req.user._id);
    res.status(<number>artist.statusCode).json(artist);
  } catch (error) {
    next(error);
  }
};

export const updateArtist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedArtist = await artistService.updateArtist(req.params.id, req.body);
    res.status(<number>updatedArtist.statusCode).json(updatedArtist);
  } catch (error) {
    next(error);
  }
};

export const deleteArtist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedArtist = await artistService.deleteArtist(req.params.id);
    res.status(<number>deletedArtist.statusCode).json(deletedArtist);
  } catch (error) {
    next(error);
  }
}; 

export const getArtistsByGenre = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const artists = await artistService.getArtistsByGenre(req.params.genre, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });
    res.json(artists);
  } catch (error) {
    next(error);
  }
};


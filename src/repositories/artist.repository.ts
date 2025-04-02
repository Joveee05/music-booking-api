import { Artist, IArtist } from '../models/artist.model';
import { CreateArtistDto, UpdateArtistDto } from '../dtos/artist.dto';
import { PaginationParams, PaginatedResponse } from '../interfaces/pagination.interface';

export interface IArtistRepository {
  FindAllArtists(
    params: PaginationParams
  ): Promise<{ artists?: PaginatedResponse<IArtist>; dbError?: Error }>;

  FindArtistById(
    id: string,
  ): Promise<{ artist?: IArtist; dbError?: Error }>;

  FindArtistByUserId(
    userId: string,
  ): Promise<{ artist?: IArtist; dbError?: Error }>;

  CreateArtist(payload: CreateArtistDto, userId: string
  ): Promise<{artist?: IArtist; dbError?: Error}>

  UpdateArtist(id: string, payload: UpdateArtistDto
  ): Promise<{artist?: IArtist; dbError?: Error}>

  DeleteArtist(id: string): Promise<{isDeleted?: boolean; dbError?: Error}>

  FindArtistsByGenre(genre: string, params: PaginationParams): Promise<{ artists?: PaginatedResponse<IArtist>; dbError?: Error }>
}

export class ArtistRepository implements IArtistRepository {
  public async FindAllArtists(params: PaginationParams): Promise<{ artists?: PaginatedResponse<IArtist>; dbError?: Error }> {
    try{
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const [artists, total] = await Promise.all([
      Artist.find()
        .populate('user', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Artist.countDocuments(),
    ]);

    return {
      artists: {
        data: artists as IArtist[],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }catch(error){
    return { dbError: error as Error };
  }
  }

  public async FindArtistById(id: string): Promise<{artist?: IArtist; dbError?: Error}> {
   try{ 
    const artist = await Artist.findById(id).populate('user', 'name email');
    return { artist: artist as IArtist, dbError: artist ? undefined : new Error('Artist not found') };
  }catch(error){
    return { dbError: error as Error };
  }
}

  public async FindArtistByUserId(userId: string): Promise<{artist?: IArtist; dbError?: Error}> {
    try{
      const artist = await Artist.findOne({ user: userId }).populate('user', 'name email');
      return { artist: artist as IArtist, dbError: artist ? undefined : new Error('Artist not found') };
    }catch(error){
      return { dbError: error as Error };
    }
  }

  public async CreateArtist(payload: CreateArtistDto, userId: string): Promise<{artist?: IArtist; dbError?: Error}> {
    try{
      const artist = await Artist.create({
      ...payload,
      user: userId,
    });
    return { artist: artist as IArtist, dbError: artist ? undefined : new Error('Artist not found') };
  }catch(error){
    return { dbError: error as Error };
  }
  }

  public async UpdateArtist(id: string, payload: UpdateArtistDto): Promise<{artist?: IArtist; dbError?: Error}> {
    try{
      const artist = await Artist.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      }).populate('user', 'name email');
      return { artist: artist as IArtist, dbError: artist ? undefined : new Error('Artist not found') };
    }catch(error){
      return { dbError: error as Error };
    }
  }

  public async DeleteArtist(id: string): Promise<{isDeleted?: boolean; dbError?: Error}> {
    try{
      const result = await Artist.findByIdAndDelete(id);
      return { isDeleted: !!result, dbError: result ? undefined : new Error('Artist not found') };
    }catch(error){
      return { dbError: error as Error };
    }
  }

  async FindArtistsByGenre(genre: string, params: PaginationParams): Promise<{artists?: PaginatedResponse<IArtist>; dbError?: Error}> {
    try{
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const [artists, total] = await Promise.all([
      Artist.find({ genres: genre })
        .populate('user', 'name email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Artist.countDocuments({ genres: genre }),
    ]);

    return {
      artists: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: artists as IArtist[],
      },
    };
  }catch(error){
    return { dbError: error as Error };
  }
  }
} 
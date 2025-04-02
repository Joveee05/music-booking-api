import { ArtistRepository, IArtistRepository } from '../repositories/artist.repository';
import { CacheService } from './cache.service';
import { CreateArtistDto, UpdateArtistDto, ArtistResponseDto } from '../dtos/artist.dto';
import { AppError } from '../middleware/error.middleware';
import { PaginationParams, PaginatedResponse } from '../interfaces/pagination.interface';
import RootService from './root.service';
import { APIResponse } from '../types/custom.types';

class ArtistService extends RootService{
  private artistRepository: IArtistRepository;
  private cacheService: CacheService;
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor() {
    super();
    this.artistRepository = new ArtistRepository();
    this.cacheService = new CacheService();
  }

  private async invalidateArtistCache(): Promise<void> {
    await this.cacheService.deletePattern('artist:*');
  }

  public async getAllArtists(params: PaginationParams): Promise<APIResponse<ArtistResponseDto>> {
    try{
      let response;

      const cacheKey = this.cacheService.generateKey('artist', 'all', JSON.stringify(params));
    const cachedArtists = await this.cacheService.get<PaginatedResponse<ArtistResponseDto>>(cacheKey);

     if (cachedArtists) {
      return this.processResponse({
        statusCode: 200,
        message: 'Artists fetched successfully',
        pagination: cachedArtists.pagination,
        data: cachedArtists.data
      });
     }

    const {artists, dbError} = await this.artistRepository.FindAllArtists(params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }
    

    await this.cacheService.set(cacheKey, artists, this.CACHE_TTL);
    
    return this.processResponse({
      statusCode: 200,
      message: 'Artists fetched successfully',
      pagination: artists?.pagination,
      data: artists?.data
    });
  } catch(error) {
    console.error('ArtistService[getAllArtists]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  public async getArtist(id: string): Promise<APIResponse<ArtistResponseDto>> {
    try{
      let response;
    const cacheKey = this.cacheService.generateKey('artist', id);
    const cachedArtist = await this.cacheService.get<ArtistResponseDto>(cacheKey);

    if (cachedArtist) {
      response = {
        statusCode: 200,
        message: 'Artist fetched successfully',
        data: cachedArtist,
      };
      return this.processResponse(response);
    }

    const {artist, dbError} = await this.artistRepository.FindArtistById(id);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, artist, this.CACHE_TTL);

    response = {
        statusCode: 200,
        message: 'Artist fetched successfully',
        data: artist,
      };
      return this.processResponse(response);

    }catch(error){
      console.error('ArtistService[getArtist]: ', error);
      return this.processResponse({
        statusCode: error instanceof AppError ? error.statusCode : 500,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        data: null,
      });
    }
  }

  async createArtist(payload: CreateArtistDto, userId: string): Promise<APIResponse<ArtistResponseDto>> {
    try{
      const {artist: existingArtist, dbError: existingArtistError} = await this.artistRepository.FindArtistByUserId(userId);
    
      if(existingArtistError){
        throw new AppError('Database error occurred', 500);
      }

      if (existingArtist) {
      throw new AppError('Artist profile already exists for this user', 400);
    }

    const {artist, dbError} = await this.artistRepository.CreateArtist(payload, userId);
    await this.invalidateArtistCache();

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    return this.processResponse({
      statusCode: 201,
      message: 'Artist created successfully',
      data: artist,
    });
  }catch(error){
    console.error('ArtistService[createArtist]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async updateArtist(id: string, payload: UpdateArtistDto): Promise<APIResponse<ArtistResponseDto>> {
   try{ 
    const {artist, dbError} = await this.artistRepository.UpdateArtist(id, payload);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    if (!artist) {
      throw new AppError('Artist not found', 404);
    }

    await this.invalidateArtistCache();
    return this.processResponse({
      statusCode: 200,
      message: 'Artist updated successfully',
      data: artist,
    });
  }catch(error){
    console.error('ArtistService[updateArtist]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
        data: null,
    });
  }
  }

  async deleteArtist(id: string): Promise<APIResponse<boolean>> {
    try{
      const {isDeleted, dbError} = await this.artistRepository.DeleteArtist(id);

      if(dbError){
        throw new AppError('Database error occurred', 500);
      }

    if (!isDeleted) {
      throw new AppError('Artist not found', 404);
    }

    await this.invalidateArtistCache();
    return this.processResponse({
      statusCode: 200,
      message: 'Artist deleted successfully',
      data: isDeleted,
    });

  }catch(error){
    console.error('ArtistService[deleteArtist]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
  }

  async getArtistsByGenre(genre: string, params: PaginationParams): Promise<APIResponse<ArtistResponseDto>> {
    try{
      let response;
      const cacheKey = this.cacheService.generateKey('artist', 'genre', genre, JSON.stringify(params));
    const cachedArtists = await this.cacheService.get<PaginatedResponse<ArtistResponseDto>>(cacheKey);

    if (cachedArtists) {
      response = {
        statusCode: 200,
        message: 'Artists fetched successfully',
        pagination: cachedArtists.pagination,
        data: cachedArtists.data,
      };
      return this.processResponse(response);
    }

    const {artists, dbError} = await this.artistRepository.FindArtistsByGenre(genre, params);

    if(dbError){
      throw new AppError('Database error occurred', 500);
    }

    await this.cacheService.set(cacheKey, artists, this.CACHE_TTL);

    response = {
      statusCode: 200,
      message: 'Artists fetched successfully',
      pagination: artists?.pagination,
      data: artists?.data,
    };
    return this.processResponse(response);

  }catch(error){
    console.error('ArtistService[getArtistsByGenre]: ', error);
    return this.processResponse({
      statusCode: error instanceof AppError ? error.statusCode : 500,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      data: null,
    });
  }
}
} 

const artistService = new ArtistService();
export default artistService;

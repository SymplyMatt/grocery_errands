import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { ILocation, Location } from '../models';

export class LocationController {
    private locationRepository: BaseRepository<ILocation>;

    constructor() {
        this.locationRepository = new BaseRepository<ILocation>(Location);
    }

    public getAllLocations = async (req: Request, res: Response): Promise<void> => {
        try {
            const locations = await this.locationRepository.find({});
            res.status(200).json(locations);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch locations', error: err });
        }
    };

    public getLocationById = async (req: Request, res: Response): Promise<void> => {
        try {
            const location = await this.locationRepository.findById(req.params.id);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
        res.status(500).json({ message: 'Error fetching location', error: err });
        }
    };

    public createLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const location = await this.locationRepository.create(req.body);
            res.status(201).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error creating location', error: err });
        }
    };

    public updateLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const location = await this.locationRepository.updateById(req.params.id, req.body);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error updating location', error: err });
        }
    };
}

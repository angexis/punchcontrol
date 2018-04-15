import { RestApiStatusCodes, ApiError } from '@punchcontrol/shared/api';
import { PatchDto } from '@punchcontrol/shared/patching';
import { PATCH_EL_RE, QUERY_EL_RE } from '@punchcontrol/shared/patching';
import { PersonDto } from '@punchcontrol/shared/person-dto';
import { CellType, ColumnDefinition, TableData } from '@punchcontrol/shared/table-data';
import { TeamMemberDto } from '@punchcontrol/shared/team-member-dto';
import { Request, Response } from 'express';
import { Service } from 'typedi';
import { Connection } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { DatabaseController } from '../db/database.controller';
import { Race } from '../entities/race';
import { TeamMember } from '../entities/team_member';
import { importFccoRegistrationCsv } from '../util/ffcoparser';
import { LOGGING } from '../util/logging';
import { ExpressController } from '../startup/express.controller';
import { GenericApi } from './generic.api';
import { WebSocketController } from '../startup/websocket.controller';
import { Application } from 'express';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class TeamApi {

    constructor(
        private databaseCtrl: DatabaseController,
        private webSocketCtrl: WebSocketController,
        private genericApi: GenericApi) { }

    registerHandlers(app: Application): any {
        app.get('/api/generic/races/:raceId/teammembers', async (req: Request, res: Response) => {
            try {

                const raceId = parseInt(req.params.raceId)

                const cols = this.genericApi.getColumns('TeamMember'); // TODO: filter with the actually requested columns
                const data = await this.genericApi.queryForColumns(this.databaseCtrl.connection, cols, q => {
                    q.where("raceId = :raceId", { raceId });
                });
                res.status(RestApiStatusCodes.SUCCESS_200_OK).send(data);
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not get team members`, detail: `${e}` };
                LOGGER.error(err.short, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
    }
}



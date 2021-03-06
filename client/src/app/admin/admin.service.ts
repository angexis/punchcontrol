import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiError } from '@punchcontrol/shared/api';
import { AppSettings } from '@punchcontrol/shared/app-settings';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { LOGGING } from '../util/logging';
import { NotificationService } from '../common/components/notification/notification.service';

const LOGGER = LOGGING.getLogger('AdminService');


@Injectable()
export class AdminService {

    settings: Observable<AppSettings>;


    constructor(private http: HttpClient, private notificationService: NotificationService) {
        this.settings = this.http.get<AppSettings>('/api/admin/settings').pipe(
            shareReplay(1)
        );
    }

    openDatabase(path: string): void {
        this.http.post('/api/admin/database', { path }).subscribe((r) => {
            LOGGER.infoc(() => `Database opened`);
        });
    }
}

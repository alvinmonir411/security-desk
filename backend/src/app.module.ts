import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RosterModule } from './roster/roster.module';
import { GuardsModule } from './guards/guards.module';
import { LocationsModule } from './locations/locations.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    RosterModule,
    GuardsModule,
    LocationsModule,
    AttendanceModule,
    LeaveModule,
  ],
})
export class AppModule {}

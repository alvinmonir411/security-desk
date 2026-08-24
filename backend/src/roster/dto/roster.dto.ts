import { IsDateString, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class GenerateRosterDto {
  @IsNotEmpty()
  @IsDateString()
  date: string; // ISO date string "2026-08-24"
}

export class ReassignGuardDto {
  @IsNotEmpty()
  @IsString()
  guardId: string;

  @IsNotEmpty()
  @IsString()
  targetLocationId: string;

  @IsNotEmpty()
  @IsString()
  targetShiftId: string;

  @IsOptional()
  @IsString()
  targetPostId?: string;

  @IsOptional()
  @IsBoolean()
  isOverride?: boolean;

  @IsOptional()
  @IsString()
  overrideReason?: string;
}

export class UpdateRosterStatusDto {
  @IsNotEmpty()
  @IsString()
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'LOCKED';
}

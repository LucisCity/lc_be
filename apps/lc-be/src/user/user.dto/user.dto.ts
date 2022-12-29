import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { UserProfile } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile.model';
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';
import { TransactionLog } from '@libs/prisma/@generated/prisma-nestjs-graphql/transaction-log/transaction-log.model';

@ObjectType()
export class AccountInfo extends PickType(UserProfile, [
  'user_id',
  'family_name',
  'given_name',
  'display_name',
  'user_name',
  'date_of_birth',
] as const) {
  @Field(() => String, { nullable: true })
  'email': string;
}

@InputType()
export class AccountInfoUpdateInput {
  @Field(() => String, { nullable: true })
  user_name!: string | null;

  @Field(() => String, { nullable: true })
  display_name!: string | null;

  @Field(() => String, { nullable: true })
  given_name!: string | null;

  @Field(() => String, { nullable: true })
  family_name!: string | null;

  @Field(() => Date, { nullable: true })
  date_of_birth!: Date | null;
}

@ObjectType()
export class ReferralDataResponse extends User {
  @Field(() => String, { nullable: true })
  reward: string;
}

@ObjectType()
export class TransactionHistoryResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => [TransactionLog], { nullable: true })
  transactionHistory: TransactionLog[];
}

// Tầm view đẹp nhất: đối diện công viên ánh sáng 36 hecta, khu biệt thự thấp tầng Mannhattan, bến du thuyền, sông Tắc và cả sông Đồng Nai. Không gian tựa resort nghỉ dưỡng 5 sao, xanh mát, rộng rãi, kiến trúc sang trọng – độc đáo – khác biệt. Các tiện ích đặc quyền C-class dành riêng: phòng lounge cigar, khu chơi golf 3D, kid club, business lounge, phòng ballroom. Hồ bơi vô cực giật cấp 3 tầng, hồ bơi thác tràn, khu tập gym dưới nước, đảo dưỡng sinh,…

// The Tropicana Garden Eco Village gives you valuable experiences when owning a unique position with Pure Green Echoes. Right here, the whole poetic sound of life is experienced by all the senses; creating a civilized, prosperous and peaceful population of The Tropicana Garden Eco Village.The project is located in a convenient traffic area, with complete infrastructure, easy connection to key administrative, commercial and tourist areas of Bao Loc City. Convenient to move to Da Lat, Bien Hoa, Ho Chi Minh City via National Highway 20 as well as easy links to neighboring provinces.

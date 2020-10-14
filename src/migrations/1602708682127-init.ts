import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1602708682127 implements MigrationInterface {
  name = 'init1602708682127';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user"
                             (
                                 "id"         varchar PRIMARY KEY NOT NULL,
                                 "first_name" varchar             NOT NULL,
                                 "last_name"  varchar             NOT NULL,
                                 "patronymic" varchar             NOT NULL,
                                 "email"      varchar             NOT NULL,
                                 "password"   varchar             NOT NULL
                             )`);
    await queryRunner.query(`CREATE TABLE "refresh_token"
                             (
                                 "id"            varchar PRIMARY KEY NOT NULL,
                                 "user_id"       varchar             NOT NULL,
                                 "refresh_token" varchar             NOT NULL,
                                 CONSTRAINT "UQ_07ec1391b1de6e40fb0bfb07faa" UNIQUE ("refresh_token")
                             )`);
    await queryRunner.query(`CREATE TABLE "temporary_refresh_token"
                             (
                                 "id"            varchar PRIMARY KEY NOT NULL,
                                 "user_id"       varchar             NOT NULL,
                                 "refresh_token" varchar             NOT NULL,
                                 CONSTRAINT "UQ_07ec1391b1de6e40fb0bfb07faa" UNIQUE ("refresh_token"),
                                 CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
                             )`);
    await queryRunner.query(`INSERT INTO "temporary_refresh_token"("id", "user_id", "refresh_token")
                             SELECT "id", "user_id", "refresh_token"
                             FROM "refresh_token"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(`ALTER TABLE "temporary_refresh_token"
        RENAME TO "refresh_token"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_token"
        RENAME TO "temporary_refresh_token"`);
    await queryRunner.query(`CREATE TABLE "refresh_token"
                             (
                                 "id"            varchar PRIMARY KEY NOT NULL,
                                 "user_id"       varchar             NOT NULL,
                                 "refresh_token" varchar             NOT NULL,
                                 CONSTRAINT "UQ_07ec1391b1de6e40fb0bfb07faa" UNIQUE ("refresh_token")
                             )`);
    await queryRunner.query(`INSERT INTO "refresh_token"("id", "user_id", "refresh_token")
                             SELECT "id", "user_id", "refresh_token"
                             FROM "temporary_refresh_token"`);
    await queryRunner.query(`DROP TABLE "temporary_refresh_token"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}

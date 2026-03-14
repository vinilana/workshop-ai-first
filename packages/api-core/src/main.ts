import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors();

  await app.listen(3001);
  console.log('API Core rodando na porta 3001');
}
bootstrap();

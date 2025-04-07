import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Configurez CORS ici
  app.enableCors({
    origin: ['http://localhost:3000'], // URL de votre frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('QVEMA API')
    .setDescription('API de mise en relation entre entrepreneurs et investisseurs')
    .setVersion('1.0')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('auth', 'Authentification')
    .addTag('interests', 'Gestion des centres d\'intérêt')
    .addTag('projects', 'Gestion des projets')
    .addTag('investments', 'Gestion des investissements')
    .addTag('admin', 'Administration')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`L'application est disponible sur ${await app.getUrl()}`);
}
bootstrap();
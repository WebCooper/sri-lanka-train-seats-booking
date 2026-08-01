import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // required by Better Auth / nestjs-better-auth
  });

  const origins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  // Swagger OpenAPI Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sri Lanka Train Seats Booking API')
    .setDescription(
      'REST API Documentation for Passenger Frontend (Next.js) & Admin Frontend (Vite) consuming NestJS Backend with Better Auth',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Better Auth Bearer token',
      },
      'bearer',
    )
    .addCookieAuth('better-auth.session_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'better-auth.session_token',
      description: 'Session cookie set automatically upon sign-in',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/docs`);
}

bootstrap();

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OAuth2Client } from 'google-auth-library'
import { JwtService } from '@nestjs/jwt'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async loginWithGoogle(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token')
    }

    const googleId = payload.sub
    const email = payload.email
    const name = payload.name ?? null

    let user = await this.prisma.user.findUnique({
      where: { google_id: googleId },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          google_id: googleId,
          name,
        },
      })
    }

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    })

    return {
      access_token: token,
      user,
    }
  }
}
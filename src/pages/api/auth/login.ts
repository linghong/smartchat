import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { DEFAULT_USERNAME, DEFAULT_PASSWORD, JWT_SECRET } from '@/config/env';
import { getAppDataSource, User } from '@/src/db';
import { loginLimiter, validateLoginInput } from '@/src/middleware/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiter
  await new Promise((resolve, reject) => {
    loginLimiter(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
  // Apply validation middleware
  await validateLoginInput(req, res);

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  try {
    const dataSource = await getAppDataSource();

    if (!dataSource) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    const userRepository = dataSource.getRepository(User);

    let user = await userRepository.findOne({ where: { username } });

    // This app is for one person
    // if user doesn't exist, create default user
    // if user exists, no more additional user
    if (
      !user &&
      username === DEFAULT_USERNAME &&
      password === DEFAULT_PASSWORD
    ) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = userRepository.create({
        username,
        password: hashedPassword
      });

      await userRepository.save(user);
    } else if (!user) {
      return res.status(401).json({ error: 'Invalid log credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid log credentials' });
    }

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '12h'
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;

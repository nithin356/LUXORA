
import React from 'react';
import { Car, Service } from './types';

export const FLEET: Car[] = [];

export const SERVICES: Service[] = [
  {
    id: 'weddings',
    title: 'Grand Weddings',
    description: 'Make your special day even more memorable with our elegant bridal fleet.',
    icon: '💍'
  },
  {
    id: 'corporate',
    title: 'Corporate Travel',
    description: 'Punctual and professional chauffeur services for elite business requirements.',
    icon: '💼'
  },
  {
    id: 'airport',
    title: 'Airport Transfers',
    description: 'Stress-free, luxurious transfers to and from Kempegowda International Airport.',
    icon: '✈️'
  },
  {
    id: 'vip',
    title: 'VIP Events',
    description: 'Discreet and high-profile transportation for celebrities and dignitaries.',
    icon: '🌟'
  }
];

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone } from 'lucide-react';

const formSchema = z.object({
  phone: z.string().min(14, 'Número inválido'),
});

export const RechargeForm = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(formSchema),
  });

  const formatPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    
    setValue('phone', value);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <section className="py-12">
      <div className="v-container flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-vivo-purple mb-4">
          Recarregue seu Vivo
        </h1>
        <p className="text-gray-600 mb-8 max-w-lg">
          Insira o número com DDD para ver as melhores ofertas para o seu chip.
        </p>
        
        <form 
          onSubmit={handleSubmit(onSubmit)}
          className="v-card w-full max-w-md flex flex-col gap-4"
        >
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Phone size={20} />
            </div>
            <input
              {...register('phone')}
              type="text"
              placeholder="(00) 00000-0000"
              onChange={formatPhone}
              className={`v-input pl-12 ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.phone && (
            <span className="text-red-500 text-xs text-left">{errors.phone.message as string}</span>
          )}
          
          <button type="submit" className="v-button-primary w-full mt-2">
            Ver ofertas
          </button>
        </form>
      </div>
    </section>
  );
};

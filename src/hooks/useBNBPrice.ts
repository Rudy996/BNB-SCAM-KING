'use client';

import { useState, useEffect } from 'react';

export function useBNBPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Используем CoinGecko API для получения цены BNB в USD
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch BNB price');
        }

        const data = await response.json();
        const bnbPrice = data.binancecoin?.usd;
        
        if (bnbPrice) {
          setPrice(bnbPrice);
        } else {
          throw new Error('Price data not found');
        }
      } catch (err) {
        console.error('Error fetching BNB price:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback цена на случай ошибки
        setPrice(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    
    // Обновляем цену каждые 60 секунд
    const interval = setInterval(fetchPrice, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { price, isLoading, error };
}

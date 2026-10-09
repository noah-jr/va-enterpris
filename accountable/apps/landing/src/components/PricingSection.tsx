import React, { useEffect, useState } from 'react';
import { Check, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import type { PlanDTO } from '@accountable/types';
import { apiGet, ApiRequestError } from '../lib/api';

interface ApiResponseEnvelope<T> {
  data: T;
  message?: string;
}

export const PricingSection: React.FC = () => {
  const [annual, setAnnual] = useState<boolean>(true);
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPlans = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiGet<ApiResponseEnvelope<PlanDTO[]>>('/plans');
        if (!cancelled) {
          setPlans(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiRequestError
              ? err.message
              : 'Não foi possível carregar os planos neste momento.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="precos" className="py-20 sm:py-28 relative border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium uppercase tracking-wider">
            Planos Transparentes
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Investimento Proporcional à Sua Escala
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Sem custos ocultos por download. Todos os planos incluem documentos verificados e um portal dedicado para os seus clientes.
          </p>

          {/* Billing Switcher */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!annual ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
              Faturação Mensal
            </span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className="relative w-11 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 p-0.5 transition-colors focus:outline-none"
              aria-label="Alternar faturação anual"
            >
              <div
                className={`w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-transform ${
                  annual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${annual ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
              Faturação Anual
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                -20%
              </span>
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="rounded-lg p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 animate-pulse space-y-4"
              >
                <div className="h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800 mt-6" />
                <div className="space-y-2 pt-4">
                  {[0, 1, 2, 3].map((line) => (
                    <div key={line} className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-6 text-center max-w-xl mx-auto space-y-2">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mx-auto" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && plans.length === 0 && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-8 text-center max-w-xl mx-auto">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              De momento não existem planos disponíveis.
            </p>
          </div>
        )}

        {!isLoading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              const price = annual ? plan.priceAnnual : plan.priceMonthly;
              const isHighlighted = plan.isPopular;
              return (
                <div
                  key={plan.id}
                  className={`rounded-lg p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative border ${
                    isHighlighted
                      ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 shadow-md'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Popular Pill */}
                  {isHighlighted && plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    {/* Plan name & badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{plan.name}</h3>
                      {!isHighlighted && plan.badge && (
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
                      {price !== null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: plan.currency || 'AOA', maximumFractionDigits: 0 }).format(price)}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">/ mês</span>
                          {annual && (
                            <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">
                              (anual)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                          Sob Consulta
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-7">
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card CTA */}
                  <a
                    href="#contacto"
                    className={`w-full py-2.5 px-4 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      isHighlighted
                        ? 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950'
                        : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

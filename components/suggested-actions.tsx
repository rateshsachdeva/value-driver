'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      desc: 'The target is a supplier of food products like fruit concentrates and food coloring to FMCG companies. It has acquired many companies in the last 5 years.',
    },
    {
      desc: 'A private equity firm is looking to acquire a fintech startup in the payment aggregation domain. The target has seen significant market share increase in recent past.',
    },
    {
      desc: 'A bus operator in Belgium has two revenue streams: bus charters and individual trips. Challenge: Asset utilization and increasing cost.',
    },
    {
      desc: 'Web development company based in Spain, mainly relies on ad-hoc or freelancing projects.',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);
              append({
                role: 'user',
                content: suggestedAction.desc,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 w-full h-auto justify-start whitespace-normal break-words"
          >
            {suggestedAction.desc}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    return true;
  },
);

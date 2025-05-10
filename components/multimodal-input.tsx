'use client';

import type { Attachment, UIMessage, Message } from 'ai';
import cx from 'classnames';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type { CreateMessage, ChatRequestOptions } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';

interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: string;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  append: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  handleSubmit: () => Promise<void>;
  className?: string;
  selectedVisibilityType: VisibilityType;
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage('input', '');

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);
    handleSubmit();
    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    if (width && width > 768) textareaRef.current?.focus();
  }, [handleSubmit, setAttachments, setLocalStorageInput, width, chatId]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/files/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        return { url: data.url, name: data.pathname, contentType: data.contentType };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadQueue(files.map((file) => file.name));
    try {
      const uploadPromises = files.map((file) => uploadFile(file));
      const uploadedAttachments = await Promise.all(uploadPromises);
      const successful = uploadedAttachments.filter(Boolean) as Attachment[];
      setAttachments((prev) => [...prev, ...successful]);
    } catch (error) {
      console.error('Error uploading files!', error);
    } finally {
      setUploadQueue([]);
    }
  }, [setAttachments]);

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') scrollToBottom();
  }, [status, scrollToBottom]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0 && (
        <SuggestedActions append={append} chatId={chatId} selectedVisibilityType={selectedVisibilityType} />
      )}

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
      />

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx('min-h-[24px] max-h-[75vh] overflow-hidden resize-none rounded-2xl text-base bg-muted pb-10', className)}
        rows={2}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (status !== 'ready') toast.error('Please wait for the model to finish its response!');
            else submitForm();
          }
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
        <Button
          className="rounded-md p-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={status !== 'ready'}
          variant="ghost"
        >
          <PaperclipIcon size={14} />
        </Button>
      </div>
      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {status === 'submitted' ? (
          <Button
            className="rounded-full p-1.5 h-fit"
            onClick={(e) => {
              e.preventDefault();
              stop();
              setMessages((m) => m);
            }}
          >
            <StopIcon size={14} />
          </Button>
        ) : (
          <Button
            className="rounded-full p-1.5 h-fit"
            onClick={(e) => {
              e.preventDefault();
              submitForm();
            }}
            disabled={input.trim() === '' || uploadQueue.length > 0}
          >
            <ArrowUpIcon size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prev, next) => {
  return (
    prev.input === next.input &&
    prev.status === next.status &&
    equal(prev.attachments, next.attachments) &&
    prev.selectedVisibilityType === next.selectedVisibilityType
  );
});

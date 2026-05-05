import * as AlertDialog from '@radix-ui/react-alert-dialog';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

export type ConfirmTone = 'default' | 'danger';

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

type ResolvedConfirmOptions = {
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  tone: ConfirmTone;
};

const ConfirmDialogContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: PropsWithChildren) {
  const resolverRef = useRef<((accepted: boolean) => void) | null>(null);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ResolvedConfirmOptions | null>(null);

  const settle = useCallback((accepted: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    setOptions(null);
    resolve?.(accepted);
  }, []);

  const confirm = useCallback<ConfirmFn>((incomingOptions) => {
    return new Promise<boolean>((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }

      resolverRef.current = resolve;
      setOptions({
        title: incomingOptions.title,
        description: incomingOptions.description,
        confirmText: incomingOptions.confirmText || 'Confirm',
        cancelText: incomingOptions.cancelText || 'Cancel',
        tone: incomingOptions.tone || 'default',
      });
      setOpen(true);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}

      <AlertDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            settle(false);
          }
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[1px]" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[130] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
            <AlertDialog.Title className="text-lg font-bold text-gray-900">
              {options?.title}
            </AlertDialog.Title>

            {options?.description ? (
              <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-gray-600">
                {options.description}
              </AlertDialog.Description>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  onClick={() => settle(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {options?.cancelText || 'Cancel'}
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={() => settle(true)}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
                    options?.tone === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {options?.confirmText || 'Confirm'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }

  return context;
}

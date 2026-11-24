import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Building2, CheckCircle2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '../../lib/apiClient';
import { createInquiry } from '../../services/inquiriesApi';
import { fetchApartments } from '../../services/apartmentsApi';

const schema = z
  .object({
    name: z.string().trim().min(2, 'Name is required'),
    phone: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        'Please enter a valid email address',
      ),
    apartmentId: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasPhone = Boolean(data.phone && data.phone.trim().length > 0);
    const hasEmail = Boolean(data.email && data.email.trim().length > 0);

    if (!hasPhone && !hasEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide at least an email address or a phone number.',
        path: ['root'],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export interface InquiryFormProps {
  defaultApartmentId?: string;
  apartmentName?: string;
  apartmentNumber?: string;
  onSuccess?: () => void;
  className?: string;
}

export function InquiryForm({
  defaultApartmentId,
  apartmentName,
  apartmentNumber,
  onSuccess,
  className = '',
}: InquiryFormProps) {
  const { data: apartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => fetchApartments(),
    enabled: !defaultApartmentId,
  });

  const defaultSubject = apartmentNumber
    ? `Inquiry for Unit ${apartmentNumber}`
    : apartmentName
    ? `Inquiry for ${apartmentName}`
    : defaultApartmentId
    ? 'Apartment inquiry'
    : '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      apartmentId: defaultApartmentId ?? '',
      subject: defaultSubject,
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createInquiry,
    onSuccess: () => {
      reset({
        name: '',
        phone: '',
        email: '',
        apartmentId: defaultApartmentId ?? '',
        subject: defaultSubject,
        message: '',
      });
      onSuccess?.();
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      name: values.name.trim(),
      phone: values.phone?.trim() || '',
      email: values.email?.trim() || '',
      apartmentId: defaultApartmentId || values.apartmentId || undefined,
      subject: values.subject?.trim() || defaultSubject || 'General Inquiry',
      message: values.message?.trim() || '',
    });
  };

  const hasContactError = Boolean(errors.root);

  if (mutation.isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-8 text-center" role="status">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-bold text-emerald-950">Inquiry Received</h3>
        <p className="mt-1.5 text-sm text-emerald-800 max-w-md mx-auto">
          Thank you! Your inquiry{apartmentNumber ? ` regarding Unit ${apartmentNumber}` : ''} has been sent directly to our leasing team. We will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => mutation.reset()}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-2xs transition hover:bg-emerald-50"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`} noValidate>
      {defaultApartmentId && (
        <input type="hidden" value={defaultApartmentId} {...register('apartmentId')} />
      )}

      {apartmentNumber && (
        <div className="flex items-center gap-2.5 rounded-xl bg-accent/8 border border-accent/20 px-4 py-3 text-xs text-navy-950">
          <Building2 className="h-4 w-4 text-accent shrink-0" />
          <span className="font-medium">
            Inquiring about: <strong className="font-semibold text-navy-950">Unit {apartmentNumber}</strong>
            {apartmentName ? ` · ${apartmentName}` : ''}
          </span>
        </div>
      )}

      {/* Row 1: Name & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="Abebe Bikila"
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-red-400/15'
                : 'border-[#E9E5E0] focus:border-accent focus:ring-accent/15'
            }`}
          />
          {errors.name ? <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Subject
          </label>
          <input
            {...register('subject')}
            placeholder="Apartment inquiry"
            className="w-full rounded-xl border border-[#E9E5E0] bg-white px-3.5 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
          {errors.subject ? <span className="mt-1 block text-xs text-red-600">{errors.subject.message}</span> : null}
        </div>
      </div>

      {/* Contact Fields: Email Address & Phone Number (At least one required) */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="name@example.com"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                errors.email || hasContactError
                  ? 'border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-red-400/15'
                  : 'border-[#E9E5E0] focus:border-accent focus:ring-accent/15'
              }`}
            />
            {errors.email ? (
              <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Phone Number
            </label>
            <input
              {...register('phone')}
              placeholder="+251 91 100 0000"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                hasContactError
                  ? 'border-red-300 bg-red-50/20 focus:border-red-400 focus:ring-red-400/15'
                  : 'border-[#E9E5E0] focus:border-accent focus:ring-accent/15'
              }`}
            />
          </div>
        </div>

        {/* Validation message only when both fields are empty */}
        {hasContactError && !errors.email ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 pt-0.5" role="alert">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.root?.message || 'Please provide at least an email address or a phone number.'}</span>
          </p>
        ) : null}
      </div>

      {/* Apartment Dropdown (only when no default apartment is given) */}
      {!defaultApartmentId ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Apartment of Interest
          </label>
          <select
            {...register('apartmentId')}
            className="w-full rounded-xl border border-[#E9E5E0] bg-white px-3.5 py-2.5 text-sm text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          >
            <option value="">General inquiry (no specific residence)</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.number})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Message
        </label>
        <textarea
          rows={4}
          {...register('message')}
          placeholder="Tell us about your requested move-in date, lease term, or any questions you have..."
          className="w-full rounded-xl border border-[#E9E5E0] bg-white px-3.5 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
        {errors.message ? <span className="mt-1 block text-xs text-red-600">{errors.message.message}</span> : null}
      </div>

      {mutation.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700" role="alert">
          {getApiErrorMessage(mutation.error)}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm shadow-accent/25 transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          <span>{mutation.isPending ? 'Submitting Inquiry…' : 'Submit Inquiry'}</span>
        </button>
      </div>
    </form>
  );
}

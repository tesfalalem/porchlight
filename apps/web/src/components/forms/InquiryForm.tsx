import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '../../lib/apiClient';
import { createInquiry } from '../../services/inquiriesApi';
import { fetchApartments } from '../../services/apartmentsApi';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(6, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  apartmentId: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function InquiryForm({
  defaultApartmentId,
  onSuccess,
}: {
  defaultApartmentId?: string;
  onSuccess?: () => void;
}) {
  const { data: apartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => fetchApartments(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      apartmentId: defaultApartmentId ?? '',
      subject: defaultApartmentId ? 'Apartment inquiry' : '',
    },
  });

  const mutation = useMutation({
    mutationFn: createInquiry,
    onSuccess: () => {
      reset();
      onSuccess?.();
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      ...values,
      apartmentId: values.apartmentId || undefined,
      subject: values.subject?.trim() || (defaultApartmentId ? 'Apartment inquiry' : 'General Inquiry'),
      message: values.message?.trim() || '',
    });
  };

  if (mutation.isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900" role="status">
        Thank you. Your inquiry has been received. Our team will contact you soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Name</span>
          <input {...register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          {errors.name ? <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Phone</span>
          <input {...register('phone')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          {errors.phone ? <span className="mt-1 block text-xs text-red-600">{errors.phone.message}</span> : null}
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Email</span>
        <input type="email" {...register('email')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.email ? <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span> : null}
      </label>
      {!defaultApartmentId ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Apartment (optional)</span>
          <select {...register('apartmentId')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">General inquiry</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.number})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Subject</span>
        <input {...register('subject')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.subject ? <span className="mt-1 block text-xs text-red-600">{errors.subject.message}</span> : null}
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Message</span>
        <textarea rows={5} {...register('message')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.message ? <span className="mt-1 block text-xs text-red-600">{errors.message.message}</span> : null}
      </label>
      {mutation.isError ? (
        <p className="text-sm text-red-600" role="alert">{getApiErrorMessage(mutation.error)}</p>
      ) : null}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-sm shadow-accent/25 transition hover:bg-accent-hover disabled:opacity-60"
      >
        {mutation.isPending ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
}

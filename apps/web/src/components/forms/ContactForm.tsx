import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage } from '../../lib/apiClient';
import { createInquiry } from '../../services/inquiriesApi';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(6, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please include a brief message'),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subject: 'Contact form message' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createInquiry(values),
    onSuccess: () => reset(),
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900" role="status">
        Thank you. Your inquiry has been received. Our team will contact you soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
      <div className="grid gap-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Name</span>
          <input {...register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          {errors.name ? <span className="text-xs text-red-600">{errors.name.message}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Phone</span>
          <input {...register('phone')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          {errors.phone ? <span className="text-xs text-red-600">{errors.phone.message}</span> : null}
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Email</span>
        <input type="email" {...register('email')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Subject</span>
        <input {...register('subject')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Message</span>
        <textarea rows={5} {...register('message')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.message ? <span className="text-xs text-red-600">{errors.message.message}</span> : null}
      </label>
      {mutation.isError ? <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error)}</p> : null}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm shadow-accent/25 transition hover:bg-accent-hover disabled:opacity-60"
      >
        {mutation.isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

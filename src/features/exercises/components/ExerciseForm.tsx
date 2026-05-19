import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Flex, Form, Input } from 'antd';
import { getYouTubeEmbedUrl } from '../../../lib/youtubeUtils';
import type { Exercise, ExerciseFormValues } from '../types';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Hareket adı zorunludur'),
  description: z.string().optional(),
  youtube_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
      'Geçerli bir URL girin',
    ),
  image_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
      'Geçerli bir URL girin',
    ),
});

interface Props {
  exercise?: Exercise;
  onSubmit: (values: ExerciseFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ExerciseForm = ({ exercise, onSubmit, onCancel, isLoading }: Props) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise?.name ?? '',
      description: exercise?.description ?? '',
      youtube_url: exercise?.youtube_url ?? '',
      image_url: exercise?.image_url ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: exercise?.name ?? '',
      description: exercise?.description ?? '',
      youtube_url: exercise?.youtube_url ?? '',
      image_url: exercise?.image_url ?? '',
    });
  }, [exercise, reset]);

  const youtubeUrl = watch('youtube_url');
  const embedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="Hareket Adı"
        required
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Örn: Barbell Squat" />}
        />
      </Form.Item>

      <Form.Item
        label="Açıklama"
        validateStatus={errors.description ? 'error' : ''}
        help={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input.TextArea {...field} rows={3} placeholder="Hareket açıklaması" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="YouTube URL"
        validateStatus={errors.youtube_url ? 'error' : ''}
        help={errors.youtube_url?.message}
      >
        <Controller
          name="youtube_url"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
          )}
        />
      </Form.Item>

      {embedUrl && (
        <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="200"
            title="YouTube önizleme"
            allowFullScreen
            style={{ border: 'none', display: 'block' }}
          />
        </div>
      )}

      <Form.Item
        label="Görsel URL"
        validateStatus={errors.image_url ? 'error' : ''}
        help={errors.image_url?.message}
      >
        <Controller
          name="image_url"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="https://..." />
          )}
        />
      </Form.Item>

      <Flex gap={8} justify="flex-end">
        <Button onClick={onCancel}>İptal</Button>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Kaydet
        </Button>
      </Flex>
    </Form>
  );
};

export default ExerciseForm;

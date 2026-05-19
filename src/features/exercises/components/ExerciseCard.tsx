import { Card, Popconfirm, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { getYouTubeThumbnailUrl } from '../../../lib/youtubeUtils';
import { useDeleteExercise } from '../hooks/useExercises';
import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
}

const ExerciseCard = ({ exercise, onEdit }: Props) => {
  const deleteMutation = useDeleteExercise();

  const thumbnailUrl =
    exercise.image_url ||
    (exercise.youtube_url ? getYouTubeThumbnailUrl(exercise.youtube_url) : null);

  return (
    <Card
      bordered={false}
      styles={{
        body: { padding: 0 },
      }}
      style={{ overflow: 'hidden', height: '100%' }}
      actions={[
        <Tooltip title="Düzenle" key="edit">
          <EditOutlined onClick={() => onEdit(exercise)} />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="Bu hareketi silmek istediğinize emin misiniz?"
          okText="Evet, Sil"
          cancelText="İptal"
          onConfirm={() => deleteMutation.mutate(exercise.id)}
        >
          <Tooltip title="Sil">
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
          </Tooltip>
        </Popconfirm>,
      ]}
    >
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#f0f4f0' }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={exercise.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VideoCameraOutlined style={{ fontSize: 32, color: '#b0b0b0' }} />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 16px' }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
          {exercise.name}
        </Typography.Text>
        {exercise.description && (
          <Typography.Paragraph
            type="secondary"
            style={{ fontSize: 13, margin: 0 }}
            ellipsis={{ rows: 2 }}
          >
            {exercise.description}
          </Typography.Paragraph>
        )}
      </div>
    </Card>
  );
};

export default ExerciseCard;

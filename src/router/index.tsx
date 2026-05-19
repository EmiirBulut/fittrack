import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Flex, Spin } from 'antd';
import AuthLayout from '../components/layout/AuthLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from './routes';

const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const ExercisesPage = lazy(() => import('../features/exercises/ExercisesPage'));
const WorkoutsPage = lazy(() => import('../features/workouts/WorkoutsPage'));
const WorkoutBuilderPage = lazy(() => import('../features/workouts/WorkoutBuilderPage'));
const ActiveWorkoutPage = lazy(() => import('../features/active-workout/ActiveWorkoutPage'));

const PageLoader = () => (
  <Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
    <Spin size="large" />
  </Flex>
);

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.EXERCISES,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ExercisesPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORKOUTS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkoutsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORKOUT_NEW,
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkoutBuilderPage />
              </Suspense>
            ),
          },
          {
            path: '/workouts/:workoutId/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkoutBuilderPage />
              </Suspense>
            ),
          },
          {
            path: '/workouts/:workoutId/start',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ActiveWorkoutPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

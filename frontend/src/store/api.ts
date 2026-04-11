import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './index'
import type { AuthUser, Habit, FeedHabit, User, LeaderboardUser, ActivityItem, RecentHabitItem, TrendingDrive, SearchResult, Project } from '@/types'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/backend',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  keepUnusedDataFor: 3600,
  tagTypes: ['Habit', 'UserProfile', 'Leaderboard', 'Project'],
  endpoints: (builder) => ({
    // Auth
    loginGoogle: builder.mutation<{ token: string; user: AuthUser }, { token: string }>({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
    }),
    loginLine: builder.mutation<{ token: string; user: AuthUser }, { code: string; redirectUri: string }>({
      query: (body) => ({ url: '/auth/line', method: 'POST', body }),
    }),
    loginX: builder.mutation<{ token: string; user: AuthUser }, { code: string; redirectUri: string; codeVerifier: string }>({
      query: (body) => ({ url: '/auth/x', method: 'POST', body }),
    }),
    loginGuest: builder.mutation<{ token: string; user: AuthUser }, void>({
      query: () => ({ url: '/auth/guest', method: 'POST' }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
    // Projects
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<Project, { name: string }>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
    // Habits
    getHabits: builder.query<Habit[], void>({
      query: () => '/habits',
      providesTags: ['Habit'],
    }),
    createHabit: builder.mutation<Habit, {
      title: string
      description: string
      driveType: number
      frequency: string
      xp: number
      imageUrl?: string | null
      reminderTime?: string | null
      projectIds?: string[]
    }>({
      query: (body) => ({ url: '/habits', method: 'POST', body }),
      invalidatesTags: ['Habit'],
    }),
    deleteHabit: builder.mutation<void, string>({
      query: (id) => ({ url: `/habits/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Habit'],
    }),
    updateHabitFull: builder.mutation<Habit, {
      id: string
      title?: string
      description?: string
      driveType?: number
      frequency?: string
      imageUrl?: string | null
      reminderTime?: string | null
      projectIds?: string[]
    }>({
      query: ({ id, ...body }) => ({ url: `/habits/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Habit'],
    }),
    toggleHabit: builder.mutation<Habit, { id: string; completed: boolean }>({
      query: ({ id, completed }) => ({ url: `/habits/${id}`, method: 'PATCH', body: { completed } }),
      async onQueryStarted({ id, completed }, { dispatch, queryFulfilled }) {
        const patchFeed = dispatch(
          api.util.updateQueryData('getFeedHabits', undefined, (draft) => {
            const habit = draft.find(h => h.id === id)
            if (habit) habit.completedToday = completed
          })
        )
        const patchHabits = dispatch(
          api.util.updateQueryData('getHabits', undefined, (draft) => {
            const habit = draft.find(h => h.id === id)
            if (habit) habit.completed = completed
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchFeed.undo()
          patchHabits.undo()
        }
      },
      invalidatesTags: ['UserProfile', 'Leaderboard'],
    }),
    // User
    getUserProfile: builder.query<User, void>({
      query: () => '/user/profile',
      providesTags: ['UserProfile'],
    }),
    getLeaderboard: builder.query<LeaderboardUser[], void>({
      query: () => '/user/leaderboard',
      providesTags: ['Leaderboard'],
    }),
    getActivity: builder.query<ActivityItem[], void>({
      query: () => '/user/activity',
    }),
    getRecentHabits: builder.query<RecentHabitItem[], void>({
      query: () => '/user/recent-habits',
      providesTags: ['Habit'],
    }),
    getFeedHabits: builder.query<FeedHabit[], void>({
      query: () => '/user/feed',
      providesTags: ['Habit'],
    }),
    updateProfile: builder.mutation<User, { name?: string; avatar?: string }>({
      query: (body) => ({ url: '/user/profile', method: 'PUT', body }),
      invalidatesTags: ['UserProfile', 'Leaderboard'],
    }),
    searchUsers: builder.query<SearchResult, string>({
      query: (q) => `/user/search?q=${encodeURIComponent(q)}`,
    }),
    getTrendingDrives: builder.query<TrendingDrive[], void>({
      query: () => '/user/trending-drives',
    }),
    getPublicProfile: builder.query<User, string>({
      query: (userId) => `/user/${userId}/profile`,
    }),
    getPublicHabits: builder.query<Habit[], string>({
      query: (userId) => `/user/${userId}/habits`,
    }),
  }),
})

export const {
  useLoginGoogleMutation,
  useLoginLineMutation,
  useLoginXMutation,
  useLoginGuestMutation,
  useGetMeQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetHabitsQuery,
  useCreateHabitMutation,
  useDeleteHabitMutation,
  useUpdateHabitFullMutation,
  useToggleHabitMutation,
  useGetUserProfileQuery,
  useGetLeaderboardQuery,
  useGetActivityQuery,
  useGetRecentHabitsQuery,
  useGetFeedHabitsQuery,
  useUpdateProfileMutation,
  useSearchUsersQuery,
  useGetTrendingDrivesQuery,
  useGetPublicProfileQuery,
  useGetPublicHabitsQuery,
} = api

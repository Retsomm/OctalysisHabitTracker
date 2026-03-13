import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './index'
import type { AuthUser, Habit, FeedHabit, User, LeaderboardUser, ActivityItem, RecentHabitItem, TrendingDrive, SearchResult } from '../types'

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
  tagTypes: ['Habit', 'UserProfile', 'Leaderboard'],
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
    // Habits
    getHabits: builder.query<Habit[], void>({
      query: () => '/habits',
      providesTags: ['Habit'],
    }),
    createHabit: builder.mutation<Habit, { title: string; description: string; driveType: number; frequency: string; xp: number }>({
      query: (body) => ({ url: '/habits', method: 'POST', body }),
      invalidatesTags: ['Habit'],
    }),
    deleteHabit: builder.mutation<void, string>({
      query: (id) => ({ url: `/habits/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Habit'],
    }),
    toggleHabit: builder.mutation<Habit, { id: string; completed: boolean }>({
      query: ({ id, completed }) => ({ url: `/habits/${id}`, method: 'PATCH', body: { completed } }),
      invalidatesTags: ['Habit', 'UserProfile', 'Leaderboard'],
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
  useGetHabitsQuery,
  useCreateHabitMutation,
  useDeleteHabitMutation,
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

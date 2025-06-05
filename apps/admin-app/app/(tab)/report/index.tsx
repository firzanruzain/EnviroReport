import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Card, Header, MainScreenLayout, ReportList } from 'ui'
import { useReportStore } from 'modules/report';



export default function index() {
  const {
    reports,
    fetchReports,
    resetReports,
    isLoading: reportsLoading,
    error: reportsError,
    fetchPollutionCounts,
    pollutionCounts,
  } = useReportStore();

  useEffect(() => {
    resetReports();
    fetchReports({append: false});
  }, []);

  return (
    <MainScreenLayout header={<Header/>}>
      <Card>
      <ReportList
              reports={reports}
              loading={reportsLoading}
            />
      </Card>
    </MainScreenLayout>
  )
}
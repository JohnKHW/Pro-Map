import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import * as Utils from "../../utils";
import { DateTime } from "luxon";
// import "./styles.css";

Chart.register(CategoryScale);
const ChartResult = (props) => {
  const { data, maxLabels = 8 } = props;
  const [startTime, setStartTime] = useState(DateTime.now());
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const groupingData = (_data) => {
    if (_data.length <= maxLabels) {
      return _data;
    }
    const groups = Math.floor(_data.length / maxLabels);
    const result = [];
    // average data by maxLabels
    for (let i = 0; i < maxLabels; i++) {
      const start = i * groups;
      const end = (i + 1) * groups;
      const groupData = _data.slice(start, end);
      const data = groupData.reduce((acc, cur) => {
        const reuslt = {};
        Object.keys(acc).forEach((key) => {
          if (!reuslt[key]) reuslt[key] = acc[key] + cur[key];
        });
        return reuslt;
      });
      // get average
      Object.keys(data).forEach((key) => {
        data[key] = data[key] / groups;
      });
      // get delta timestamp of first and last item

      result.push({ ...data });
    }
    return result;
  };
  const timeLabel = (timestamps) => {
    return timestamps.map((timestamp) => {
      const endTime = DateTime.fromMillis(Math.round(timestamp));
      const deltaTime = endTime
        .diff(startTime, ["seconds", "minutes", "hours"])
        .toObject();
      if (deltaTime.hours > 0) {
        return `${deltaTime.hours.toFixed(3)}h${deltaTime.minutes.toFixed()}m`;
      }
      if (deltaTime.minutes > 0) {
        return `${deltaTime.minutes.toFixed()}m${deltaTime.seconds.toFixed()}s`;
      }
      return `${deltaTime.seconds.toFixed(3)}s`;
    });
  };
  const formatData = (_data) => {
    const groupedData = groupingData(_data);
    return {
      labels: timeLabel(groupedData.map((data) => data.timestamp)),
      datasets: [
        {
          label: "Angry",
          data: groupedData.map((data) => data.angry),
          borderColor: Utils.CHART_COLORS.red,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
          borderWidth: 2,
        },
        {
          label: "Disgusted",
          data: groupedData.map((data) => data.disgusted),
          borderColor: Utils.CHART_COLORS.green,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.green, 0.5),
          borderWidth: 2,
        },
        {
          label: "Fearful",
          data: groupedData.map((data) => data.fearful),
          borderColor: Utils.CHART_COLORS.orange,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.orange, 0.5),
          borderWidth: 2,
        },
        {
          label: "Happy",
          data: groupedData.map((data) => data.happy),
          borderColor: Utils.CHART_COLORS.yellow,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.yellow, 0.5),
          borderWidth: 2,
        },
        {
          label: "Neutral",
          data: groupedData.map((data) => data.neutral),
          borderColor: Utils.CHART_COLORS.grey,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.grey, 0.5),
          borderWidth: 2,
        },
        {
          label: "Sad",
          data: groupedData.map((data) => data.sad),
          borderColor: Utils.CHART_COLORS.blue,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
        },
        {
          label: "Surprised",
          data: groupedData.map((data) => data.surprised),
          borderColor: Utils.CHART_COLORS.purple,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.purple, 0.5),
          borderWidth: 2,
        },
      ],
    };
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(formatData(data));
      setStartTime(DateTime.fromMillis(data[0].timestamp));
    }
  }, [data]);

  return (
    <div className="chart-container">
      <Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "User Expression",
            },
            legend: {
              display: true,
            },
          },
        }}
      />
    </div>
  );
};

export default ChartResult;

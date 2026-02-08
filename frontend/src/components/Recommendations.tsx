// frontend/src/components/Recommendations.tsx
import React from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface RecommendationsProps {
  recommendations: string[];
}

const Recommendations: React.FC<RecommendationsProps> = ({ recommendations }) => {
  return (
    <Card style={{ marginBottom: 20 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Recommendations
        </Typography>
        <List dense>
          {recommendations.map((rec, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>
                <LightbulbIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={rec} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default Recommendations;

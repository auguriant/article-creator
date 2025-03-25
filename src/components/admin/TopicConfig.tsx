
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Edit, Check } from "lucide-react";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Topic {
  id: string;
  name: string;
  isDefault: boolean;
}

export function TopicConfig() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load topics from localStorage on component mount
  useEffect(() => {
    const savedTopics = localStorage.getItem('content_topics');
    if (savedTopics) {
      try {
        setTopics(JSON.parse(savedTopics));
      } catch (e) {
        console.error("Error parsing saved topics:", e);
      }
    } else {
      // Default topic if none saved
      const defaultTopics: Topic[] = [
        { id: '1', name: 'Artificial Intelligence', isDefault: true },
      ];
      setTopics(defaultTopics);
      localStorage.setItem('content_topics', JSON.stringify(defaultTopics));
    }
  }, []);

  // Save topics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('content_topics', JSON.stringify(topics));
  }, [topics]);

  const handleAddTopic = () => {
    if (!newTopic.trim()) {
      toast.error("Please provide a topic name");
      return;
    }
    
    // Check if topic already exists
    if (topics.some(topic => topic.name.toLowerCase() === newTopic.trim().toLowerCase())) {
      toast.error("This topic already exists");
      return;
    }
    
    const newTopicItem: Topic = {
      id: crypto.randomUUID(),
      name: newTopic.trim(),
      isDefault: topics.length === 0
    };
    
    setTopics([...topics, newTopicItem]);
    setNewTopic('');
    toast.success(`Added new topic: ${newTopic}`);
  };

  const handleRemoveTopic = (id: string) => {
    const topicToRemove = topics.find(topic => topic.id === id);
    
    // If trying to remove the default topic, show an error
    if (topicToRemove?.isDefault) {
      toast.error("Cannot remove the default topic");
      return;
    }
    
    setTopics(topics.filter(topic => topic.id !== id));
    toast.success("Topic removed");
  };

  const handleEditTopic = (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (topic) {
      setEditingTopic(id);
      setEditValue(topic.name);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }
    
    // Check if name already exists (except for the current topic)
    if (topics.some(topic => topic.id !== id && topic.name.toLowerCase() === editValue.trim().toLowerCase())) {
      toast.error("This topic name already exists");
      return;
    }
    
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, name: editValue.trim() } : topic
    ));
    
    setEditingTopic(null);
    toast.success("Topic updated");
  };

  const handleSetDefault = (id: string) => {
    setTopics(topics.map(topic => 
      ({ ...topic, isDefault: topic.id === id })
    ));
    
    const topic = topics.find(t => t.id === id);
    if (topic) {
      toast.success(`${topic.name} set as default topic`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No topics added yet. Add your first topic below.
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">
                    {editingTopic === topic.id ? (
                      <Input 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-[250px]"
                        autoFocus
                      />
                    ) : (
                      topic.name
                    )}
                  </TableCell>
                  <TableCell>
                    {topic.isDefault && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingTopic === topic.id ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSaveEdit(topic.id)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditTopic(topic.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          {!topic.isDefault && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSetDefault(topic.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Set Default
                            </Button>
                          )}
                          {!topic.isDefault && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleRemoveTopic(topic.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Add New Topic</h3>
        <div className="flex gap-4">
          <Input
            placeholder="e.g., Technology, Health, Finance"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddTopic}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-3">Tips</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>The default topic will be used for automatic content generation</li>
          <li>Adding diverse topics helps generate more targeted content</li>
          <li>Use specific topics for better AI content generation results</li>
        </ul>
      </div>
    </div>
  );
}

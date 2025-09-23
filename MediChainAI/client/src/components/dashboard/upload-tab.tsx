import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function UploadTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    weight: "",
    cholesterol: "",
    bloodSugar: "",
    recordType: "vitals",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadDataMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/health-records', data);
    },
    onSuccess: (response) => {
      const data = response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/health-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: "Data Uploaded!",
        description: `Your health data has been encrypted and stored on blockchain. You earned ${data.rewardEarned} HTK!`,
      });
      // Reset form
      setFormData({
        age: "",
        gender: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        weight: "",
        cholesterol: "",
        bloodSugar: "",
        recordType: "vitals",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: "File Uploaded!",
        description: `Your file has been processed and stored securely. You earned ${data.rewardEarned} HTK!`,
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers where needed
    const processedData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : undefined,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
      weight: formData.weight ? parseInt(formData.weight) : undefined,
      cholesterol: formData.cholesterol ? parseInt(formData.cholesterol) : undefined,
      bloodSugar: formData.bloodSugar ? parseInt(formData.bloodSugar) : undefined,
    };

    uploadDataMutation.mutate(processedData);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      uploadFileMutation.mutate(selectedFile);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Upload Health Data</CardTitle>
          <p className="text-slate-600 mt-2">Securely add your health information to earn HealthTokens</p>
        </div>
        <div className="flex items-center space-x-2 bg-health-green-50 px-4 py-2 rounded-xl">
          <i className="fas fa-shield-check text-health-green-600"></i>
          <span className="text-sm font-medium text-health-green-700">End-to-end Encrypted</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Manual Entry Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Manual Entry</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-medium text-slate-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-medium text-slate-900 mb-4">Vital Signs</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Blood Pressure</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={formData.bloodPressureSystolic}
                        onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                        placeholder="120"
                      />
                      <Input
                        type="number"
                        value={formData.bloodPressureDiastolic}
                        onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                        placeholder="80"
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Systolic / Diastolic (mmHg)</div>
                  </div>
                  <div>
                    <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      value={formData.heartRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="165"
                    />
                  </div>
                </div>
              </div>

              {/* Lab Results */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-medium text-slate-900 mb-4">Lab Results (Optional)</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cholesterol">Cholesterol (mg/dL)</Label>
                    <Input
                      id="cholesterol"
                      type="number"
                      value={formData.cholesterol}
                      onChange={(e) => setFormData(prev => ({ ...prev, cholesterol: e.target.value }))}
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodSugar">Blood Sugar (mg/dL)</Label>
                    <Input
                      id="bloodSugar"
                      type="number"
                      value={formData.bloodSugar}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodSugar: e.target.value }))}
                      placeholder="95"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-medical-blue-500 hover:bg-medical-blue-600"
                disabled={uploadDataMutation.isPending}
              >
                {uploadDataMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-alt mr-2"></i>
                    Encrypt & Upload to Blockchain
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* File Upload */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">File Upload</h3>
            
            {/* Drag & Drop Zone */}
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-medical-blue-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="w-16 h-16 bg-medical-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cloud-upload-alt text-medical-blue-600 text-2xl"></i>
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">
                {selectedFile ? selectedFile.name : 'Drop files here or click to upload'}
              </h4>
              <p className="text-sm text-slate-600 mb-4">Supported formats: CSV, JSON, PDF, DICOM</p>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".csv,.json,.pdf,.dcm"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            {selectedFile && (
              <Button 
                onClick={handleFileUpload}
                className="w-full bg-medical-blue-500 hover:bg-medical-blue-600"
                disabled={uploadFileMutation.isPending}
              >
                {uploadFileMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Upload File
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <i className="fas fa-info-circle text-medical-blue-500"></i>
            <span>You'll earn <strong className="text-crypto-gold-600">50-100 HTK</strong> for this upload</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
